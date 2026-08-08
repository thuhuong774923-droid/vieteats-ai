const { createClient } = require("redis");

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis error:", err.message));
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.warn("⚠️  Redis not available, continuing without cache:", err.message);
    redisClient = null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
