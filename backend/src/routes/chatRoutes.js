const express = require("express");
const { sendMessage, getHistory, recognizeImage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/history", protect, getHistory);
router.post("/image", protect, recognizeImage);

module.exports = router;
