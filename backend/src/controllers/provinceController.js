const Province = require("../models/Province");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const aiService = require("../services/aiService");

const getProvinces = async (req, res, next) => {
  try {
    const { region, q } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (q) filter.$text = { $search: q };
    const provinces = await Province.find(filter).sort({ name: 1 });
    res.json({ success: true, data: provinces, total: provinces.length });
  } catch (err) {
    next(err);
  }
};

const getProvinceBySlug = async (req, res, next) => {
  try {
    const province = await Province.findOne({ slug: req.params.slug });
    if (!province) return res.status(404).json({ success: false, message: "Không tìm thấy tỉnh thành" });
    province.viewCount += 1;
    await province.save();

    const [foods, restaurants] = await Promise.all([
      Food.find({ province: province._id }).limit(12).select("name images priceMin priceMax rating slug"),
      Restaurant.find({ province: province._id }).sort({ rating: -1 }).limit(8),
    ]);

    res.json({ success: true, data: { province, foods, restaurants } });
  } catch (err) {
    next(err);
  }
};

const getProvinceAIStory = async (req, res, next) => {
  try {
    const province = await Province.findOne({ slug: req.params.slug });
    if (!province) return res.status(404).json({ success: false, message: "Không tìm thấy tỉnh thành" });
    if (!province.aiStory) {
      province.aiStory = await aiService.generateStory({ name: province.name, type: "province" });
      await province.save();
    }
    res.json({ success: true, data: province.aiStory });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProvinces, getProvinceBySlug, getProvinceAIStory };
