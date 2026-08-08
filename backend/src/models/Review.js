const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["Food", "Restaurant", "Province"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    images: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
