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
