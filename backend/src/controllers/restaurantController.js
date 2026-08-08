const Restaurant = require("../models/Restaurant");

const getRestaurants = async (req, res, next) => {
  try {
    const { province, q, near, radius = 5000, page = 1, limit = 20, sort = "-rating" } = req.query;
    const filter = {};
    if (province) filter.province = province;
    if (q) filter.$text = { $search: q };
    if (near) {
      const [lng, lat] = near.split(",").map(Number);
      filter.location = {
        $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: Number(radius) },
      };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const sortMap = { "-rating": { rating: -1 }, newest: { createdAt: -1 } };
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate("province", "name slug")
        .sort(sortMap[sort] || {})
        .skip(skip)
        .limit(Number(limit)),
      Restaurant.countDocuments(filter),
    ]);
    res.json({ success: true, data: restaurants, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("province", "name slug")
      .populate("foods", "name images priceMin priceMax rating slug");
    if (!restaurant) return res.status(404).json({ success: false, message: "Không tìm thấy quán ăn" });
    res.json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRestaurants, getRestaurantById };
