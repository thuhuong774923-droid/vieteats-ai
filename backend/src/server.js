require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initSocket = require("./socket/index");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRedis();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });
  initSocket(io);
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`🚀 VietEats AI API chạy tại http://localhost:${PORT}`);
  });
};

start();
