const mongoose = require("mongoose");

const passportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    points: { type: Number, default: 0 },
    exploredProvinces: [
      {
        province: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        checkedInAt: { type: Date, default: Date.now },
      },
    ],
    eatenFoods: [
      {
        food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
        eatenAt: { type: Date, default: Date.now },
      },
    ],
    checkins: [
      {
        name: String,
        province: { type: mongoose.Schema.Types.ObjectId, ref: "Province" },
        lat: Number,
        lng: Number,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    badges: [
      {
        name: String,
        tier: { type: String, enum: ["Bronze", "Silver", "Gold", "Diamond"] },
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    qrCode: { type: String, default: "" },
    certificateUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Passport", passportSchema);
