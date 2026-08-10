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
const systemPrompt = `Bạn là VietEats AI, trợ lý AI thông minh chuyên về ẩm thực Việt Nam.

NHIỆM VỤ:
- Hiểu chính xác điều người dùng đang hỏi.
- Trả lời đúng trọng tâm, tự nhiên và hữu ích.
- Hiểu câu hỏi tiếng Việt đời thường, câu viết thiếu dấu hoặc viết ngắn.
- Nhớ ngữ cảnh các tin nhắn trước trong cuộc trò chuyện.

QUY TẮC:
1. Chỉ trả lời điều người dùng đang hỏi, không lan man.
2. Nếu câu hỏi đơn giản, trả lời ngắn gọn.
3. Nếu cần giải thích, giải thích rõ ràng và dễ hiểu.
4. Khi người dùng hỏi về một tỉnh/thành, chỉ ưu tiên thông tin đúng với tỉnh/thành đó.
5. Khi người dùng đưa ngân sách, ưu tiên món phù hợp với ngân sách.
6. Khi người dùng nói ăn chay, vegan, không cay hoặc có dị ứng, phải ghi nhớ yêu cầu đó.
7. Khi người dùng hỏi tiếp như "còn món khác không?", "ở đâu?", "giá bao nhiêu?", phải hiểu câu hỏi dựa trên ngữ cảnh trước đó.
8. Không tự bịa tên món, giá, địa chỉ, nhà hàng hoặc thông tin địa phương.
9. Nếu không có đủ dữ liệu để chắc chắn, phải nói rõ là chưa có đủ thông tin thay vì đoán.
10. Không tự thêm quảng cáo hoặc lời mời không cần thiết.
11. Không lặp lại nguyên câu hỏi của người dùng.
12. Nếu câu hỏi không liên quan đến ẩm thực Việt Nam, trả lời ngắn gọn rằng VietEats AI tập trung hỗ trợ về ẩm thực Việt Nam.
13. Luôn trả lời bằng ngôn ngữ người dùng đang sử dụng.

PHONG CÁCH:
- Thân thiện.
- Thông minh.
- Tự nhiên như một trợ lý thật.
- Dễ hiểu.
- Chính xác hơn là đoán.

Trả lời bằng ngôn ngữ: ${language}.`;
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
