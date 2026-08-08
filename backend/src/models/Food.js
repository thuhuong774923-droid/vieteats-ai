const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: "Province", required: true },
    region: { type: String, enum: ["Bắc", "Trung", "Nam"], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    images: [{ type: String }],
    videoUrl: { type: String, default: "" },
    priceMin: { type: Number, required: true },
    priceMax: { type: Number, required: true },
    spiceLevel: { type: Number, min: 0, max: 5, default: 1 },
    isVegetarian: { type: Boolean, default: false },
    story: {
      history: { type: String, default: "" },
      origin: { type: String, default: "" },
      culturalMeaning: { type: String, default: "" },
      legend: { type: String, default: "" },
    },
    ingredients: [{ type: String }],
    recipe: [{ step: Number, description: String }],
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carb: { type: Number, default: 0 },
    },
    aiExplanation: { type: String, default: "" },
    embedding: { type: [Number], default: undefined, select: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", tags: "text" });
foodSchema.index({ region: 1, priceMin: 1, rating: -1 });

module.exports = mongoose.model("Food", foodSchema);
