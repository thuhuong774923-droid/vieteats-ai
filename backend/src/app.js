const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");

const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const provinceRoutes = require("./routes/provinceRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const communityRoutes = require("./routes/communityRoutes");
const passportRoutes = require("./routes/passportRoutes");
const chatRoutes = require("./routes/chatRoutes");
const searchRoutes = require("./routes/searchRoutes");
const recommendRoutes = require("./routes/recommendRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, message: "VietEats AI API is running 🍜" }));

/**
 * Route seed dữ liệu qua trình duyệt - dùng cho môi trường không có Shell (vd Render free tier).
 * Bảo vệ bằng khoá bí mật SEED_SECRET_KEY (biến môi trường) - không ai đoán được thì không chạy được.
 * Có khoá chống chạy trùng lặp (isSeeding) - nếu trình duyệt lỡ gửi 2 yêu cầu cùng lúc
 * (do tải lại trang, tính năng "tải trước" của Chrome...) thì yêu cầu thứ 2 sẽ bị từ chối
 * thay vì làm hỏng dữ liệu giữa chừng.
 * Cách dùng: mở  https://<domain>/api/run-seed/<SEED_SECRET_KEY>  trên trình duyệt MỘT LẦN.
 * ⚠️ Chạy lại sau khi đã xong sẽ XOÁ và tạo lại toàn bộ dữ liệu - không mở link này nhiều lần khi đã có dữ liệu thật.
 */
let isSeeding = false;
app.get("/api/run-seed/:key", async (req, res) => {
  const expectedKey = process.env.SEED_SECRET_KEY;
  if (!expectedKey) {
    return res.status(403).json({ success: false, message: "SEED_SECRET_KEY chưa được cấu hình trên server." });
  }
  if (req.params.key !== expectedKey) {
    return res.status(403).json({ success: false, message: "Sai khoá bí mật." });
  }
  if (isSeeding) {
    return res.status(429).json({
      success: false,
      message: "Đang seed dữ liệu rồi (có yêu cầu khác đang chạy) - vui lòng đợi, đừng mở lại link này.",
    });
  }
  isSeeding = true;
  try {
    const { runSeed } = require("./seed/seed");
    const result = await runSeed({ destroy: false });
    res.json({
      success: true,
      message: "🎉 Seed dữ liệu hoàn tất! Đã tạo xong 63 tỉnh, món ăn, nhà hàng, đánh giá và tài khoản mẫu.",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi seed dữ liệu: " + err.message });
  } finally {
    isSeeding = false;
  }
});

app.use("/api/foods", foodRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
