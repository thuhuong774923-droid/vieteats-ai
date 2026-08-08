const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Không tìm thấy route: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
