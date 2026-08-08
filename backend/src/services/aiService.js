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
    const systemPrompt = `Bạn là VietEats AI - trợ lý ẩm thực Việt Nam thông minh. Trả lời bằng ngôn ngữ: ${language}.
Bạn có thể tư vấn món ăn, lịch trình ăn uống, quán ăn theo ngân sách/vị trí/thời tiết/sở thích/dị ứng/ăn chay/trẻ em/người già.
Trả lời ngắn gọn, thân thiện, có gợi ý cụ thể (tên món, khoảng giá, khu vực).`;
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  }

  // Fallback rule-based (không cần API key) - vẫn truy vấn dữ liệu thật trong DB
  return ruleBasedAssistant(message, context);
};

const ruleBasedAssistant = async (message) => {
  const budgetMatch = message.match(/(\d+)[.,]?(\d{3})?\s?(k|nghìn|đ|vnd)/i);
  let priceLimit = 200000;
  if (budgetMatch) {
    const raw = budgetMatch[0].replace(/[^\d]/g, "");
    priceLimit = raw.length <= 3 ? parseInt(raw) * 1000 : parseInt(raw);
  }
  const foods = await Food.find({ priceMin: { $lte: priceLimit } })
    .sort({ rating: -1 })
    .limit(5)
    .populate("province", "name");

  if (!foods.length) {
    return "Xin lỗi, hiện chưa có dữ liệu phù hợp. Bạn thử mô tả rõ hơn về ngân sách và địa điểm nhé!";
  }
  const list = foods
    .map((f) => `• ${f.name} (${f.province?.name || ""}) - khoảng ${f.priceMin.toLocaleString()}đ - ${f.priceMax.toLocaleString()}đ, rating ${f.rating.toFixed(1)}⭐`)
    .join("\n");
  return `Với ngân sách khoảng ${priceLimit.toLocaleString()}đ, VietEats AI gợi ý:\n${list}\n\nBạn muốn mình chỉ đường tới quán gần nhất không?`;
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
