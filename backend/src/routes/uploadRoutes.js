const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { protect } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Chưa chọn file" });
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "your_cloud_name") {
      return res.status(200).json({
        success: true,
        message: "Cloudinary chưa được cấu hình - trả về placeholder",
        data: { url: "/placeholder-upload.jpg" },
      });
    }
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, { folder: "vieteats-ai" });
    res.json({ success: true, data: { url: result.secure_url } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
