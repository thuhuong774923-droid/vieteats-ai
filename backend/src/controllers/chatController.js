const ChatHistory = require("../models/ChatHistory");
const aiService = require("../services/aiService");

// @route POST /api/chat
const sendMessage = async (req, res, next) => {
  try {
    const { message, language = "vi" } = req.body;
    let chat = await ChatHistory.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    if (!chat) chat = await ChatHistory.create({ user: req.user._id, messages: [] });

    chat.messages.push({ role: "user", content: message, language });
    const reply = await aiService.chatWithAI({
      message,
      language,
      history: chat.messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    });
    chat.messages.push({ role: "assistant", content: reply, language });
    await chat.save();

    res.json({ success: true, data: { reply, chatId: chat._id } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chat/history
const getHistory = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: chat?.messages || [] });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/chat/image  (Image Recognition)
const recognizeImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const result = await aiService.recognizeFoodFromImage(imageUrl);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getHistory, recognizeImage };
