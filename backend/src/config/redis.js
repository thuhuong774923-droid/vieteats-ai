const { createClient } = require("redis");

let redisClient;

/**
 * Kết nối Redis (cache tuỳ chọn). Nếu chưa có Redis (ví dụ mới deploy lần đầu,
 * chưa gắn Redis instance), hàm này KHÔNG được phép làm treo quá trình khởi động
 * server - vì vậy: giới hạn số lần thử kết nối lại, có timeout, và luôn resolve
 * (không bao giờ throw ra ngoài) để server.listen() vẫn chạy được bình thường.
 */
const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL chưa được cấu hình - bỏ qua Redis, server vẫn chạy bình thường.");
    redisClient = null;
    return;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000, // tối đa 5s cho lần thử đầu, tránh treo server
        reconnectStrategy: (retries) => (retries > 3 ? false : Math.min(retries * 200, 1000)),
      },
    });
    redisClient.on("error", (err) => {
      // Chỉ log 1 dòng ngắn, tránh spam log khi Redis không khả dụng
      if (!redisClient.__loggedError) {
        console.warn("⚠️  Redis không khả dụng, tiếp tục chạy không cache:", err.message);
        redisClient.__loggedError = true;
      }
    });
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.warn("⚠️  Không kết nối được Redis, tiếp tục chạy không cache:", err.message);
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
