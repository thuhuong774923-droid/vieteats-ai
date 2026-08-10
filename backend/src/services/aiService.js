const OpenAI = require("openai");

const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Province = require("../models/Province");

// ======================================================
// OPENAI
// ======================================================

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// ======================================================
// HÀM HỖ TRỢ
// ======================================================

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
};

const safeNumber = (value, fallback = null) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

// Lấy thông tin tỉnh/thành từ database
const findProvinceFromMessage = async (message) => {
  try {
    const provinces = await Province.find({})
      .select("name slug")
      .lean();

    const normalizedMessage = normalizeText(message);

    return (
      provinces.find((province) => {
        const name = normalizeText(province.name);
        const slug = normalizeText(province.slug || "");

        return (
          normalizedMessage.includes(name) ||
          (slug && normalizedMessage.includes(slug))
        );
      }) || null
    );
  } catch (error) {
    console.error("findProvinceFromMessage:", error.message);
    return null;
  }
};

// ======================================================
// LẤY DỮ LIỆU ẨM THỰC THẬT TỪ DATABASE
// ======================================================

const getFoodContext = async ({
  provinceId = null,
  budget = null,
  diet = null,
  spiceLevel = null,
  limit = 15,
} = {}) => {
  try {
    const query = {};

    if (provinceId) {
      query.province = provinceId;
    }

    if (budget) {
      query.priceMin = { $lte: budget };
    }

    if (diet === "vegetarian" || diet === "vegan") {
      query.isVegetarian = true;
    }

    if (spiceLevel !== null && spiceLevel !== undefined) {
      query.spiceLevel = { $lte: spiceLevel };
    }

    const foods = await Food.find(query)
      .sort({
        rating: -1,
        viewCount: -1,
      })
      .limit(limit)
      .populate("province", "name slug")
      .lean();

    return foods;
  } catch (error) {
    console.error("getFoodContext:", error.message);
    return [];
  }
};

// ======================================================
// LẤY NHÀ HÀNG TỪ DATABASE
// ======================================================

const getRestaurantContext = async ({
  provinceId = null,
  limit = 10,
} = {}) => {
  try {
    const query = {};

    if (provinceId) {
      query.province = provinceId;
    }

    const restaurants = await Restaurant.find(query)
      .sort({
        rating: -1,
        viewCount: -1,
      })
      .limit(limit)
      .populate("province", "name slug")
      .lean();

    return restaurants;
  } catch (error) {
    console.error("getRestaurantContext:", error.message);
    return [];
  }
};

// ======================================================
// NHẬN DIỆN NHU CẦU NGƯỜI DÙNG
// ======================================================

const detectPreferences = (message = "") => {
  const text = normalizeText(message);

  let diet = null;

  if (
    text.includes("chay") ||
    text.includes("vegetarian") ||
    text.includes("an chay")
  ) {
    diet = "vegetarian";
  }

  if (
    text.includes("vegan") ||
    text.includes("thuan chay")
  ) {
    diet = "vegan";
  }

  let spiceLevel = null;

  if (
    text.includes("khong cay") ||
    text.includes("it cay") ||
    text.includes("khong an cay")
  ) {
    spiceLevel = 1;
  }

  if (
    text.includes("cay vua") ||
    text.includes("cay vua phai")
  ) {
    spiceLevel = 2;
  }

  if (
    text.includes("an cay") ||
    text.includes("cay nhieu") ||
    text.includes("rat cay")
  ) {
    spiceLevel = 5;
  }

  // Tìm ngân sách kiểu:
  // 200k
  // 200.000
  // 200000
  // 200 nghìn
  // 200 ngàn
  let budget = null;

  const budgetMatch = text.match(
    /(\d[\d.,]*)\s*(k|nghin|ngan|trieu|tr)?/i
  );

  if (budgetMatch) {
    let raw = budgetMatch[1]
      .replace(/\./g, "")
      .replace(/,/g, "");

    let value = Number(raw);

    const unit = budgetMatch[2];

    if (unit === "k" || unit === "nghin" || unit === "ngan") {
      value *= 1000;
    }

    if (unit === "trieu") {
      value *= 1000000;
    }

    if (Number.isFinite(value) && value > 0) {
      budget = value;
    }
  }

  return {
    diet,
    spiceLevel,
    budget,
  };
};

// ======================================================
// FORMAT DATABASE CHO AI
// ======================================================

const formatFoodsForAI = (foods = []) => {
  if (!foods.length) {
    return "Không có dữ liệu món ăn phù hợp trong database.";
  }

  return foods
    .map((food, index) => {
      const provinceName =
        food.province?.name || "Không rõ tỉnh";

      const priceMin =
        food.priceMin != null
          ? food.priceMin.toLocaleString("vi-VN")
          : "?";

      const priceMax =
        food.priceMax != null
          ? food.priceMax.toLocaleString("vi-VN")
          : "?";

      const rating =
        food.rating != null
          ? food.rating
          : "chưa có";

      return (
        `${index + 1}. ${food.name}\n` +
        `- Tỉnh: ${provinceName}\n` +
        `- Giá: ${priceMin}đ - ${priceMax}đ\n` +
        `- Rating: ${rating}\n` +
        `- Vegetarian: ${food.isVegetarian ? "Có" : "Không"}\n` +
        `- Spice level: ${
          food.spiceLevel != null ? food.spiceLevel : "chưa có"
        }`
      );
    })
    .join("\n\n");
};

const formatRestaurantsForAI = (restaurants = []) => {
  if (!restaurants.length) {
    return "Không có dữ liệu nhà hàng phù hợp trong database.";
  }

  return restaurants
    .map((restaurant, index) => {
      return (
        `${index + 1}. ${restaurant.name}\n` +
        `- Địa chỉ: ${restaurant.address || "chưa có"}\n` +
        `- Rating: ${restaurant.rating ?? "chưa có"}\n` +
        `- Tỉnh: ${restaurant.province?.name || "chưa có"}`
      );
    })
    .join("\n\n");
};

// ======================================================
// SYSTEM PROMPT
// ======================================================

const buildSystemPrompt = ({
  language = "vi",
  province = null,
  preferences = {},
  foods = [],
  restaurants = [],
}) => {
  return `
Bạn là VietEats AI - trợ lý thông minh chuyên về ẩm thực và du lịch ẩm thực Việt Nam.

NHIỆM VỤ:
1. Hiểu chính xác người dùng đang hỏi gì.
2. Trả lời trực tiếp câu hỏi, không lan man.
3. Tư vấn món ăn dựa trên nhu cầu cá nhân.
4. Có thể xây dựng lịch trình ăn uống theo tỉnh/thành.
5. Nếu người dùng đưa ngân sách, phải ưu tiên món phù hợp ngân sách.
6. Nếu người dùng nói ăn chay/vegan/không cay/ăn cay... phải ghi nhớ và áp dụng.
7. Nếu người dùng hỏi về một tỉnh/thành, ưu tiên dữ liệu đúng tỉnh/thành đó.
8. Có thể đề xuất bữa sáng, trưa, chiều, tối.
9. Có thể lập lịch trình 1 ngày, 2 ngày hoặc 3 ngày.
10. Nếu người dùng hỏi món nào nên ăn, giải thích ngắn gọn tại sao.

QUY TẮC QUAN TRỌNG:
- Không được bịa tên món ăn có trong DATABASE.
- Không được bịa giá.
- Không được bịa rating.
- Không được khẳng định một nhà hàng tồn tại nếu DATABASE không có.
- Nếu database không có dữ liệu, phải nói rõ là chưa có dữ liệu.
- Có thể đưa kiến thức chung về ẩm thực Việt Nam nhưng phải phân biệt rõ với dữ liệu database.
- Nếu chưa chắc món ăn thuộc tỉnh nào, không được khẳng định chắc chắn.
- Không lặp lại nguyên câu hỏi của người dùng.
- Câu hỏi đơn giản thì trả lời ngắn.
- Câu hỏi phức tạp thì trả lời có cấu trúc.
- Luôn trả lời bằng ${language}.

PHONG CÁCH:
- Thân thiện.
- Tự nhiên.
- Thông minh.
- Dễ hiểu.
- Giống một trợ lý du lịch thật.
- Không nói những câu máy móc như "Theo dữ liệu được cung cấp..." nếu không cần thiết.

THÔNG TIN NGƯỜI DÙNG HIỆN TẠI:
- Tỉnh/thành: ${province?.name || "chưa xác định"}
- Chế độ ăn: ${preferences.diet || "không yêu cầu"}
- Mức cay: ${
    preferences.spiceLevel != null
      ? preferences.spiceLevel
      : "không yêu cầu"
  }
- Ngân sách: ${
    preferences.budget
      ? `${preferences.budget.toLocaleString("vi-VN")}đ`
      : "không xác định"
  }

DATABASE MÓN ĂN:
${formatFoodsForAI(foods)}

DATABASE NHÀ HÀNG:
${formatRestaurantsForAI(restaurants)}

NẾU NGƯỜI DÙNG MUỐN LỊCH TRÌNH:
Ví dụ:
"Cho tôi lịch trình ăn uống 1 ngày ở Huế"

Hãy trả lời dạng:

🌅 Buổi sáng
- Món:
- Vì sao nên ăn:
- Khoảng giá:

☀️ Buổi trưa
- Món:
- Vì sao nên ăn:
- Khoảng giá:

☕ Buổi chiều
- Món:
- Vì sao nên ăn:
- Khoảng giá:

🌙 Buổi tối
- Món:
- Vì sao nên ăn:
- Khoảng giá:

💰 Ước tính ngân sách:
...

Nếu có dữ liệu nhà hàng phù hợp thì có thể đề xuất nhà hàng.

Nếu người dùng hỏi:
"Gia đình tôi có người ăn chay"

Hãy ưu tiên món vegetarian/vegan.

Nếu người dùng hỏi:
"Tôi có 200k"

Hãy ưu tiên các món nằm trong ngân sách.

Nếu người dùng hỏi:
"Tôi không ăn cay"

Không được đề xuất món có mức cay cao.

Nếu người dùng hỏi:
"Ở tỉnh đó có món gì ngon?"

Hãy hiểu "tỉnh đó" dựa vào ngữ cảnh cuộc trò chuyện trước đó.

Nếu câu hỏi không liên quan đến ẩm thực Việt Nam, hãy trả lời ngắn gọn rằng VietEats AI tập trung hỗ trợ ẩm thực và du lịch ẩm thực Việt Nam.
`;
};

// ======================================================
// CHAT AI
// ======================================================

const chatWithAI = async ({
  message,
  language = "vi",
  history = [],
  context = {},
}) => {
  try {
    // -----------------------------------------------
    // Tìm tỉnh/thành người dùng đang nói tới
    // -----------------------------------------------

    let province = null;

    if (context?.provinceId) {
      province = await Province.findById(context.provinceId)
        .select("name slug")
        .lean();
    }

    if (!province) {
      province = await findProvinceFromMessage(message);
    }

    // Nếu không tìm được trong câu hiện tại,
    // kiểm tra lịch sử chat
    if (!province && history.length) {
      const previousText = history
        .map((item) => item.content || "")
        .join(" ");

      province = await findProvinceFromMessage(previousText);
    }

    // -----------------------------------------------
    // Nhận diện nhu cầu
    // -----------------------------------------------

    const preferences = {
      ...detectPreferences(message),
      ...(context.preferences || {}),
    };

    // -----------------------------------------------
    // Lấy dữ liệu database
    // -----------------------------------------------

    const foods = await getFoodContext({
      provinceId: province?._id,
      budget: preferences.budget,
      diet: preferences.diet,
      spiceLevel: preferences.spiceLevel,
      limit: 20,
    });

    const restaurants = await getRestaurantContext({
      provinceId: province?._id,
      limit: 10,
    });

    // -----------------------------------------------
    // Nếu có OpenAI -> AI thông minh
    // -----------------------------------------------

    if (openai) {
      const systemPrompt = buildSystemPrompt({
        language,
        province,
        preferences,
        foods,
        restaurants,
      });

      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },

        // Giữ lịch sử nhưng không gửi quá dài
        ...history.slice(-12).map((item) => ({
          role:
            item.role === "assistant"
              ? "assistant"
              : "user",
          content: item.content,
        })),

        {
          role: "user",
          content: message,
        },
      ];

      const completion =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.4,
          max_tokens: 1200,
        });

      return (
        completion.choices?.[0]?.message?.content ||
        "Xin lỗi, mình chưa thể trả lời câu hỏi này."
      );
    }

    // -----------------------------------------------
    // Không có API KEY
    // -----------------------------------------------

    return ruleBasedAssistant({
      message,
      province,
      foods,
      preferences,
    });
  } catch (error) {
    console.error("chatWithAI ERROR:", error);

    return ruleBasedAssistant({
      message,
      preferences: detectPreferences(message),
    });
  }
};

// ======================================================
// FALLBACK - KHÔNG CẦN OPENAI API KEY
// ======================================================

const ruleBasedAssistant = async ({
  message,
  province = null,
  foods = [],
  preferences = {},
}) => {
  if (!foods.length) {
    return province
      ? `Mình chưa có đủ dữ liệu món ăn của ${province.name} trong database. Bạn có thể thử hỏi mình về một tỉnh khác hoặc mô tả nhu cầu cụ thể hơn nhé.`
      : "Mình chưa có đủ dữ liệu để trả lời chính xác câu này. Bạn hãy cho mình biết tỉnh/thành, ngân sách hoặc nhu cầu ăn uống nhé.";
  }

  const list = foods
    .slice(0, 5)
    .map((food) => {
      const min =
        food.priceMin?.toLocaleString("vi-VN") || "?";

      const max =
        food.priceMax?.toLocaleString("vi-VN") || "?";

      return `• ${food.name}: ${min}đ - ${max}đ`;
    })
    .join("\n");

  return (
    `Nếu bạn đang tìm món ${
      province ? `ở ${province.name}` : "phù hợp"
    }, mình gợi ý:\n\n` +
    `${list}\n\n` +
    `Bạn có thể cho mình biết ngân sách, số người và khẩu vị để mình chọn chính xác hơn nhé.`
  );
};

// ======================================================
// RECOMMEND FOODS
// ======================================================

const recommendFoods = async ({
  preferences = {},
  budget = null,
  region = null,
  limit = 10,
}) => {
  try {
    const query = {};

    if (region) {
      query.province = region;
    }

    if (budget) {
      query.priceMax = {
        $lte: budget,
      };
    }

    if (
      preferences.diet === "vegetarian" ||
      preferences.diet === "vegan"
    ) {
      query.isVegetarian = true;
    }

    if (
      preferences.spiceLevel !== undefined &&
      preferences.spiceLevel !== null
    ) {
      query.spiceLevel = {
        $lte: preferences.spiceLevel,
      };
    }

    const foods = await Food.find(query)
      .sort({
        rating: -1,
        viewCount: -1,
      })
      .limit(limit)
      .populate("province", "name slug")
      .lean();

    return foods;
  } catch (error) {
    console.error("recommendFoods:", error.message);
    return [];
  }
};

// ======================================================
// LẬP LỊCH TRÌNH ĂN UỐNG
// ======================================================

const createFoodItinerary = async ({
  provinceId,
  days = 1,
  budget = null,
  preferences = {},
  language = "vi",
}) => {
  try {
    const province = await Province.findById(provinceId)
      .select("name slug")
      .lean();

    if (!province) {
      return {
        success: false,
        message: "Không tìm thấy tỉnh/thành.",
      };
    }

    const foods = await getFoodContext({
      provinceId,
      budget,
      diet: preferences.diet,
      spiceLevel: preferences.spiceLevel,
      limit: 30,
    });

    if (!foods.length) {
      return {
        success: false,
        message:
          `Chưa có đủ dữ liệu món ăn ở ${province.name}.`,
      };
    }

    if (!openai) {
      return {
        success: true,
        province: province.name,
        days,
        foods,
      };
    }

    const prompt = `
Hãy lập lịch trình ăn uống ${days} ngày tại ${province.name}.

Nhu cầu:
- Ngân sách: ${
      budget
        ? `${budget.toLocaleString("vi-VN")}đ`
        : "không giới hạn"
    }
- Chế độ ăn: ${preferences.diet || "bình thường"}
- Mức cay: ${
      preferences.spiceLevel ?? "không yêu cầu"
    }

Chỉ sử dụng những món có trong danh sách dưới đây:

${formatFoodsForAI(foods)}

Mỗi ngày gồm:
- Bữa sáng
- Bữa trưa
- Bữa chiều
- Bữa tối

Mỗi lựa chọn ghi:
- Tên món
- Giá dự kiến
- Lý do nên ăn

Cuối cùng tính ngân sách ước tính.

Không được tự bịa món hoặc giá.
Viết bằng ${language}.
`;

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Bạn là chuyên gia lập lịch trình du lịch ẩm thực Việt Nam.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1800,
      });

    return {
      success: true,
      province: province.name,
      days,
      itinerary:
        completion.choices?.[0]?.message?.content || "",
    };
  } catch (error) {
    console.error("createFoodItinerary:", error);

    return {
      success: false,
      message: "Không thể tạo lịch trình lúc này.",
    };
  }
};

// ======================================================
// AI STORY
// ======================================================

const generateStory = async ({
  name,
  type = "food",
  language = "vi",
}) => {
  if (!openai) {
    return `${name} là một phần thú vị trong văn hóa ẩm thực Việt Nam, gắn với những nét đặc trưng về hương vị, nguyên liệu và đời sống địa phương.`;
  }

  try {
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Bạn là người kể chuyện về ẩm thực Việt Nam.
Viết bằng ${language}.
Nếu không chắc về nguồn gốc hoặc truyền thuyết,
không được bịa thành sự thật.
`,
          },
          {
            role: "user",
            content:
              `Hãy kể ngắn gọn về ${type === "food" ? "món ăn" : "vùng đất"} "${name}".`,
          },
        ],
        temperature: 0.4,
        max_tokens: 500,
      });

    return (
      completion.choices?.[0]?.message?.content ||
      "Chưa thể tạo câu chuyện."
    );
  } catch (error) {
    console.error("generateStory:", error.message);

    return `Chưa thể tạo câu chuyện về ${name} lúc này.`;
  }
};

// ======================================================
// NHẬN DIỆN MÓN ĂN TỪ ẢNH
// ======================================================

const recognizeFoodFromImage = async (imageUrl) => {
  if (!openai) {
    return "Không thể nhận diện vì chưa cấu hình OPENAI_API_KEY.";
  }

  try {
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Bạn là chuyên gia nhận diện món ăn Việt Nam.

Hãy:
1. Nhận diện món ăn nếu có thể.
2. Nếu không chắc, nói rõ "có thể là".
3. Không được khẳng định chắc chắn khi ảnh không đủ rõ.
4. Trả lời ngắn gọn.
`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Hãy nhận diện món ăn Việt Nam trong ảnh này.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

    return (
      completion.choices?.[0]?.message?.content ||
      "Không thể nhận diện món ăn."
    );
  } catch (error) {
    console.error(
      "recognizeFoodFromImage:",
      error.message
    );

    return "Không thể nhận diện ảnh lúc này.";
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  chatWithAI,
  recommendFoods,
  createFoodItinerary,
  generateStory,
  recognizeFoodFromImage,
};
