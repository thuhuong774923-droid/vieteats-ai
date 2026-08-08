const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    region: { type: String, enum: ["Bắc", "Trung", "Nam"], required: true },
    coverImage: { type: String, default: "" },
    gallery: [{ type: String }],
    videoUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    history: { type: String, default: "" },
    cuisine: { type: String, default: "" },
    festivals: [
      {
        name: String,
        time: String,
        description: String,
      },
    ],
    famousRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    attractions: [
      {
        name: String,
        lat: Number,
        lng: Number,
        description: String,
        image: String,
      },
    ],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    population: { type: Number, default: 0 },
    aiStory: { type: String, default: "" },
    audioStoryUrl: { type: String, default: "" },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

provinceSchema.index({ name: "text", cuisine: "text", description: "text" });

module.exports = mongoose.model("Province", provinceSchema);
