const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: "Province", required: true },
    address: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    images: [{ type: String }],
    foods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Food" }],
    priceRange: { type: String, enum: ["$", "$$", "$$$", "$$$$"], default: "$$" },
    openHours: { type: String, default: "07:00 - 22:00" },
    phone: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", address: "text" });
restaurantSchema.index({ province: 1, rating: -1 });
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
