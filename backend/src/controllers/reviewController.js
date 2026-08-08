const Review = require("../models/Review");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const modelMap = { Food, Restaurant };

const getReviews = async (req, res, next) => {
  try {
    const { targetType, targetId, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, data: reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment, images } = req.body;
    const review = await Review.create({ user: req.user._id, targetType, targetId, rating, comment, images });

    const Model = modelMap[targetType];
    if (Model) {
      const stats = await Review.aggregate([
        { $match: { targetType, targetId: review.targetId } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      if (stats.length) {
        await Model.findByIdAndUpdate(targetId, { rating: stats[0].avg, ratingCount: stats[0].count });
      }
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

const likeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
    const idx = review.likes.indexOf(req.user._id);
    if (idx > -1) review.likes.splice(idx, 1);
    else review.likes.push(req.user._id);
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, createReview, likeReview };
