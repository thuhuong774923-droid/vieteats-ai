// Bộ sinh dữ liệu mẫu tiếng Việt (không cần thư viện faker ngoài)

const foodBaseNames = [
  "Phở bò", "Phở gà", "Bún chả", "Bún bò", "Bún riêu", "Bún đậu mắm tôm", "Bánh mì",
  "Bánh xèo", "Bánh cuốn", "Bánh khọt", "Bánh căn", "Bánh bèo", "Bánh nậm", "Bánh lọc",
  "Cơm tấm", "Cơm cháy", "Cơm gà", "Cao lầu", "Mì Quảng", "Hủ tiếu", "Chả cá", "Nem rán",
  "Nem nướng", "Gỏi cuốn", "Gỏi cá", "Lẩu mắm", "Lẩu cá kèo", "Lẩu thái", "Cháo lòng",
  "Cháo vịt", "Xôi xéo", "Xôi gà", "Chè", "Nộm", "Gà nướng", "Gà quay", "Vịt quay",
  "Ốc", "Ếch chiên", "Bò né", "Bò lá lốt", "Chạo tôm", "Nem chua", "Tré", "Dê núi",
  "Cá lóc nướng", "Cá kho tộ", "Tôm rang", "Mực nướng", "Chả mực", "Bánh đa cua",
];

const restaurantPrefixes = ["Quán", "Nhà hàng", "Tiệm", "Quán ăn", "Bếp", "Food Court", "Món Ngon"];
const restaurantSuffixes = ["Cô Ba", "Chú Tư", "Bà Sáu", "Anh Hai", "Gia Truyền", "Xưa", "Ngon", "Đặc Sản",
  "Truyền Thống", "Miền Trung", "Sài Gòn", "Hà Nội", "129", "68", "Ẩm Thực Việt", "Ông Địa", "Homemade"];

const streetNames = ["Lê Lợi", "Trần Hưng Đạo", "Nguyễn Huệ", "Hai Bà Trưng", "Lý Thường Kiệt", "Phan Chu Trinh",
  "Nguyễn Trãi", "Hùng Vương", "Trần Phú", "Lê Duẩn", "Điện Biên Phủ", "Nguyễn Văn Linh", "Cách Mạng Tháng 8"];

const reviewComments = [
  "Món ăn rất ngon, đậm đà hương vị địa phương!",
  "Không gian quán thoáng mát, phục vụ nhiệt tình.",
  "Giá cả hợp lý, sẽ quay lại lần sau.",
  "Hương vị đúng chuẩn truyền thống, rất đáng thử.",
  "Món ăn hơi mặn nhưng nhìn chung ổn.",
  "Nguyên liệu tươi ngon, trình bày đẹp mắt.",
  "Phục vụ hơi chậm nhưng chất lượng món ăn bù lại.",
  "Đây là một trong những món ngon nhất tôi từng ăn!",
  "Quán sạch sẽ, nhân viên thân thiện.",
  "Vị vừa miệng, hợp với khẩu vị gia đình.",
  "Nên đặt bàn trước vì quán khá đông khách.",
  "Đặc sản địa phương chính hiệu, rất đáng tiền.",
];

const firstNames = ["An", "Bình", "Chi", "Dũng", "Em", "Giang", "Hà", "Hoa", "Huy", "Khánh", "Lan", "Linh",
  "Minh", "Nam", "Ngọc", "Oanh", "Phúc", "Quân", "Quỳnh", "Sơn", "Thảo", "Thắng", "Trang", "Trung", "Tuấn",
  "Uyên", "Việt", "Vy", "Yến", "Duy"];
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ",
  "Ngô", "Dương", "Lý"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => Number((Math.random() * (max - min) + min).toFixed(decimals));
const jitterCoord = (val, range = 0.15) => val + (Math.random() - 0.5) * range;

const slugify = require("slugify");
const makeSlug = (text, suffix) => slugify(`${text}-${suffix}`, { lower: true, locale: "vi", strict: true });

const randomFullName = () => `${pick(lastNames)} ${pick(firstNames)} ${pick(firstNames)}`;

const randomTags = () => {
  const pool = ["đặc sản", "truyền thống", "đường phố", "gia đình", "nổi tiếng", "healthy", "ăn vặt", "món chính"];
  const count = randInt(1, 3);
  return Array.from(new Set(Array.from({ length: count }, () => pick(pool))));
};

module.exports = {
  foodBaseNames,
  restaurantPrefixes,
  restaurantSuffixes,
  streetNames,
  reviewComments,
  pick,
  randInt,
  randFloat,
  jitterCoord,
  makeSlug,
  randomFullName,
  randomTags,
};
