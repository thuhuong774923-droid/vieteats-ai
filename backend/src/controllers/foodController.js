const Food = require("../models/Food");
const Bookmark = require("../models/Bookmark");
const aiService = require("../services/aiService");

// @route GET /api/foods
const getFoods = async (req, res, next) => {
  try {
    const {
      q,
      region,
      province,
      category,
      priceMin,
      priceMax,
      spiceLevel,
      isVegetarian,
      sort = "-rating",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (region) filter.region = region;
    if (province) filter.province = province;
    if (category) filter.category = category;
    if (isVegetarian) filter.isVegetarian = isVegetarian === "true";
    if (spiceLevel) filter.spiceLevel = { $lte: Number(spiceLevel) };
    if (priceMin || priceMax) {
      filter.priceMin = {};
      if (priceMin) filter.priceMin.$gte = Number(priceMin);
      if (priceMax) filter.priceMin.$lte = Number(priceMax);
    }

    const sortMap = {
      "-rating": { rating: -1 },
      rating: { rating: 1 },
      "-viewCount": { viewCount: -1 },
      newest: { createdAt: -1 },
      "-price": { priceMin: -1 },
      price: { priceMin: 1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [foods, total] = await Promise.all([
      Food.find(filter)
        .populate("province", "name slug region")
        .populate("category", "name slug")
        .sort(sortMap[sort] || { rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: foods,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/foods/:id
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate("province")
      .populate("category");
    if (!food) return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    food.viewCount += 1;
    await food.save();

    const related = await Food.find({ region: food.region, _id: { $ne: food._id } })
      .limit(6)
      .select("name images priceMin priceMax rating slug");

    res.json({ success: true, data: { food, related } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/foods/:id/ai-explain
const explainFoodWithAI = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Không tìm thấy món ăn" });
    if (!food.aiExplanation) {
      food.aiExplanation = await aiService.generateStory({ name: food.name, type: "food" });
      await food.save();
    }
    res.json({ success: true, data: food.aiExplanation });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/foods/:id/bookmark
const toggleBookmark = async (req, res, next) => {
  try {
    const existing = await Bookmark.findOne({
      user: req.user._id,
      targetType: "Food",
      targetId: req.params.id,
    });
    if (existing) {
      await existing.deleteOne();
      await Food.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });
      return res.json({ success: true, bookmarked: false });
    }
    await Bookmark.create({ user: req.user._id, targetType: "Food", targetId: req.params.id });
    await Food.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: 1 } });
    res.json({ success: true, bookmarked: true });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/foods/trending
const getTrending = async (req, res, next) => {
  try {
    const foods = await Food.find({ isTrending: true }).limit(10).populate("province", "name");
    res.json({ success: true, data: foods });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFoods, getFoodById, explainFoodWithAI, toggleBookmark, getTrending };
