const jwt = require("jsonwebtoken");

module.exports = function initSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      }
      next();
    } catch (err) {
      next(); // cho phép kết nối ẩn danh (chỉ nhận thông báo public)
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId || "guest"})`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("community:typing", (data) => {
      socket.broadcast.emit("community:typing", data);
    });

    socket.on("chat:message", (data) => {
      // Realtime relay cho AI Assistant chat UI (kết hợp REST /api/chat để lưu lịch sử)
      socket.emit("chat:ack", { received: true, ...data });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  // Helper để controller khác có thể emit thông báo realtime
  global.emitNotification = (userId, payload) => {
    io.to(`user:${userId}`).emit("notification", payload);
  };
};
