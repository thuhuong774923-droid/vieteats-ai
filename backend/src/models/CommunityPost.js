const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: "" },
    images: [{ type: String }],
    video: { type: String, default: "" },
    hashtags: [{ type: String }],
    checkin: {
      name: String,
      lat: Number,
      lng: Number,
      province: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
    },
    relatedFood: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityPost", communityPostSchema);
