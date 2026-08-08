const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true }, // singleton - luôn chỉ có 1 document với key "global"
    siteName: { type: String, default: "VietEats AI" },
    maintenanceMode: { type: Boolean, default: false },
    aiModel: { type: String, enum: ["gpt-4o-mini", "gemini-1.5-flash"], default: "gpt-4o-mini" },
    pushNotificationsEnabled: { type: Boolean, default: true },
    contactEmail: { type: String, default: "contact@vieteats.ai" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
