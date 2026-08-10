const OpenAI = require("openai");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Sinh câu trả lời AI Assistant.
 * Nếu chưa cấu hình OPENAI_API_KEY / GEMINI_API_KEY sẽ trả lời bằng rule-based fallback
 * (đủ để chạy demo mà không cần key), khi có key sẽ tự động dùng GPT thật.
 */
const chatWithAI = async ({ message, language = "vi", history = [], context = {} }) => {
  if (openai) {
    const systemPrompt = `Bạn là VietEats AI - trợ lý chuyên tư vấn ẩm thực Việt Nam.

Trả lời bằng ngôn ngữ: ${language}.

QUY TẮC QUAN TRỌNG:
1. Khi người dùng hỏi đặc sản hoặc món ăn ở một tỉnh/thành phố, chỉ gợi ý những món thực sự thuộc địa phương đó.
2. Tuyệt đối không lấy món của tỉnh/thành phố khác rồi nói là đặc sản của địa phương đang được hỏi.
3. Nếu người dùng hỏi về Huế, ưu tiên các món đặc sản Huế như bún bò Huế, cơm hến, bánh bèo Huế, bánh nậm, bánh lọc, chè Huế...
4. Nếu không chắc món đó có phải đặc sản của địa phương hay không, không được khẳng định. Hãy nói rõ rằng thông tin chưa chắc chắn.
5. Khi người dùng đưa ngân sách, ưu tiên các món phù hợp với ngân sách đó.
6. Không tự bịa tên món ăn, giá tiền, nhà hàng, địa chỉ hoặc đánh giá.
7. Nếu có dữ liệu món ăn được cung cấp từ hệ thống/database thì ưu tiên sử dụng dữ liệu đó.
8. Nếu câu hỏi không đủ thông tin, hãy hỏi lại địa điểm, ngân sách hoặc sở thích.
9. Trả lời ngắn gọn, dễ hiểu, thân thiện và bằng tiếng Việt khi người dùng hỏi bằng tiếng Việt.

Mục tiêu là đưa ra thông tin ẩm thực Việt Nam chính xác và phù hợp với địa phương mà người dùng hỏi.`;
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });
    return completion.choices[0].message.content;
  }

  // Fallback rule-based (không cần API key) - vẫn truy vấn dữ liệu thật trong DB
  return ruleBasedAssistant(message, context);
};

const ruleBasedAssistant = async (message) => {
  const budgetMatch = message.match(/(\d+)[.,]?\s*(\d{3})?\s*(k|nghìn|đ|vnd)?/i);

  let priceLimit = 200000;

  if (budgetMatch) {
    const raw = budgetMatch[0].replace(/[^\d]/g, "");
    priceLimit = raw.length <= 3 ? parseInt(raw) * 1000 : parseInt(raw);
  }

  // Xác định tỉnh/thành người dùng đang hỏi
  const provinceKeywords = [
    "Huế",
    "Hà Nội",
    "Hải Phòng",
    "Đà Nẵng",
    "Hồ Chí Minh",
    "TP Hồ Chí Minh",
    "Sài Gòn",
    "Hội An",
    "Nha Trang",
    "Đà Lạt",
    "Cần Thơ",
    "Hưng Yên",
    "Hải Dương",
    "Vĩnh Phúc",
  ];

  const provinceName = provinceKeywords.find((name) =>
    message.toLowerCase().includes(name.toLowerCase())
  );

  let foods = await Food.find({
    priceMin: { $lte: priceLimit },
  })
    .sort({ rating: -1 })
    .limit(20)
    .populate("province", "name");

  // Nếu người dùng hỏi địa phương cụ thể,
  // chỉ giữ món thuộc đúng địa phương đó
  if (provinceName) {
    foods = foods.filter(
      (food) =>
        food.province?.name?.toLowerCase() === provinceName.toLowerCase()
    );
  }

  if (!foods.length) {
    return provinceName
      ? `Mình chưa tìm thấy dữ liệu món ăn phù hợp ở ${provinceName} trong ngân sách ${priceLimit.toLocaleString()}đ. Bạn thử tăng ngân sách hoặc hỏi địa phương khác nhé.`
      : "Xin lỗi, hiện chưa có dữ liệu món ăn phù hợp. Bạn thử cho mình biết địa điểm và ngân sách nhé.";
  }

  const list = foods
    .slice(0, 5)
    .map(
      (f) =>
        `• ${f.name} (${f.province?.name || "Chưa xác định"}) - khoảng ${f.priceMin?.toLocaleString()}đ - ${f.priceMax?.toLocaleString()}đ`
    )
    .join("\n");

  return `Với ngân sách khoảng ${priceLimit.toLocaleString()}đ${
    provinceName ? ` ở ${provinceName}` : ""
  }, VietEats AI gợi ý:\n${list}\n\nBạn muốn mình gợi ý thêm món hoặc quán ăn gần bạn không?`;
};

/**
 * Recommendation Engine: gợi ý món dựa trên sở thích + lịch sử người dùng.
 * Đơn giản hoá bằng content-based filtering trên tags/region/priceRange,
 * sẵn sàng thay thế bằng vector embeddings + cosine similarity (RAG) khi có OPENAI_API_KEY.
 */
const recommendFoods = async ({ preferences = {}, budget, region, limit = 10 }) => {
  const query = {};
  if (region) query.region = region;
  if (budget) query.priceMax = { $lte: budget };
  if (preferences.diet === "vegetarian" || preferences.diet === "vegan") query.isVegetarian = true;
  if (preferences.spiceLevel !== undefined) query.spiceLevel = { $lte: preferences.spiceLevel };

  const foods = await Food.find(query)
    .sort({ rating: -1, viewCount: -1 })
    .limit(limit)
    .populate("province", "name slug");
  return foods;
};

/**
 * AI Story: sinh câu chuyện / nguồn gốc món ăn hoặc tỉnh thành.
 */
const generateStory = async ({ name, type = "food", language = "vi" }) => {
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn là người kể chuyện ẩm thực Việt Nam. Viết bằng ${language}, giọng văn cuốn hút, súc tích (150-200 từ).`,
        },
        {
          role: "user",
          content: `Kể câu chuyện / nguồn gốc / truyền thuyết về ${type === "food" ? "món ăn" : "vùng đất"}: ${name}`,
        },
      ],
    });
    return completion.choices[0].message.content;
  }
  return `${name} là một phần không thể thiếu trong bức tranh ẩm thực Việt Nam, mang trong mình câu chuyện văn hoá và lịch sử lâu đời được truyền qua nhiều thế hệ.`;
};

/**
 * Image Recognition: nhận diện món ăn từ ảnh (dùng GPT-4o Vision khi có key).
 */
const recognizeFoodFromImage = async (imageUrl) => {
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Đây là món ăn Việt Nam nào? Trả lời ngắn gọn tên món." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });
    return completion.choices[0].message.content;
  }
  return "Không thể nhận diện (chưa cấu hình OPENAI_API_KEY)";
};

module.exports = {
  chatWithAI,
  recommendFoods,
  generateStory,
  recognizeFoodFromImage,
};
