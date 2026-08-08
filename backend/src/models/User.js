const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    provider: { type: String, enum: ["local", "google", "facebook", "apple"], default: "local" },
    phone: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    points: { type: Number, default: 0 },
    preferences: {
      diet: { type: String, enum: ["none", "vegetarian", "vegan", "halal", "keto"], default: "none" },
      allergies: [{ type: String }],
      spiceLevel: { type: Number, min: 0, max: 5, default: 2 },
      favoriteRegions: [{ type: String }],
    },
    settings: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "vi" },
      notifications: { type: Boolean, default: true },
    },
    fcmTokens: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otpCode;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
