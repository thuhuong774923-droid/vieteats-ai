const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        language: { type: String, default: "vi" },
        imageUrl: { type: String },
        audioUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    model: { type: String, enum: ["gpt", "gemini"], default: "gpt" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
