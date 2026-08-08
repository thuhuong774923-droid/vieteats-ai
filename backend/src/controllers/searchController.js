const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Province = require("../models/Province");

// @route GET /api/search?q=...  (autocomplete + realtime search, dùng chung cho voice/text search)
const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ success: true, data: { foods: [], restaurants: [], provinces: [] } });

    const regex = new RegExp(q, "i");
    const [foods, restaurants, provinces] = await Promise.all([
      Food.find({ name: regex }).limit(6).select("name images priceMin slug"),
      Restaurant.find({ name: regex }).limit(6).select("name images address slug"),
      Province.find({ name: regex }).limit(4).select("name slug coverImage"),
    ]);

    res.json({ success: true, data: { foods, restaurants, provinces } });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
