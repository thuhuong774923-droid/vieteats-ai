const User = require("../models/User");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Province = require("../models/Province");
const CommunityPost = require("../models/CommunityPost");
const ChatHistory = require("../models/ChatHistory");
const Settings = require("../models/Settings");

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, foodCount, restaurantCount, reviewCount, postCount] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
      Restaurant.countDocuments(),
      Review.countDocuments(),
      CommunityPost.countDocuments(),
    ]);

    const topFoods = await Food.find().sort({ rating: -1, viewCount: -1 }).limit(5).select("name rating viewCount");

    const topProvincesAgg = await Food.aggregate([
      { $group: { _id: "$province", foodCount: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
      { $sort: { foodCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "provinces", localField: "_id", foreignField: "_id", as: "province" } },
      { $unwind: "$province" },
      { $project: { "province.name": 1, foodCount: 1, avgRating: 1 } },
    ]);

    const reviewsByMonth = await Review.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        counts: { userCount, foodCount, restaurantCount, reviewCount, postCount },
        topFoods,
        topProvinces: topProvincesAgg,
        reviewsByMonth,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Generic CRUD cho Food (admin)
const createFood = async (req, res, next) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá món ăn" });
  } catch (err) {
    next(err);
  }
};

// ---------- RESTAURANTS (admin) ----------
const getRestaurantsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = q ? { name: new RegExp(q, "i") } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).populate("province", "name").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Restaurant.countDocuments(filter),
    ]);
    res.json({ success: true, data: restaurants, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const createRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Không tìm thấy nhà hàng" });
    res.json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
};

const deleteRestaurant = async (req, res, next) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá nhà hàng" });
  } catch (err) {
    next(err);
  }
};

// ---------- LOCATIONS (Provinces admin) ----------
const getProvincesAdmin = async (req, res, next) => {
  try {
    const provinces = await Province.find().sort({ name: 1 });
    res.json({ success: true, data: provinces });
  } catch (err) {
    next(err);
  }
};

const updateProvince = async (req, res, next) => {
  try {
    const province = await Province.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: province });
  } catch (err) {
    next(err);
  }
};

// ---------- REVIEWS (moderation) ----------
const getReviewsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, reportedOnly } = req.query;
    const filter = reportedOnly === "true" ? { isReported: true } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).populate("user", "name avatar").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, data: reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá đánh giá" });
  } catch (err) {
    next(err);
  }
};

// ---------- REPORTS (báo cáo vi phạm - dựa trên Review.isReported) ----------
const getReports = async (req, res, next) => {
  try {
    const reports = await Review.find({ isReported: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { action } = req.body; // "dismiss" | "delete"
    if (action === "delete") {
      await Review.findByIdAndDelete(req.params.id);
    } else {
      await Review.findByIdAndUpdate(req.params.id, { isReported: false });
    }
    res.json({ success: true, message: "Đã xử lý báo cáo" });
  } catch (err) {
    next(err);
  }
};

// ---------- COMMUNITY (moderation) ----------
const getCommunityPostsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      CommunityPost.find().populate("user", "name avatar").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      CommunityPost.countDocuments(),
    ]);
    res.json({ success: true, data: posts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const deleteCommunityPost = async (req, res, next) => {
  try {
    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xoá bài đăng" });
  } catch (err) {
    next(err);
  }
};

// ---------- AI LOGS ----------
const getAiLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      ChatHistory.find().populate("user", "name avatar").sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      ChatHistory.countDocuments(),
    ]);
    res.json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// ---------- ANALYTICS (mở rộng dashboard) ----------
const getAnalytics = async (req, res, next) => {
  try {
    const usersByMonth = await User.aggregate([
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);
    const topUsersByPoints = await User.find().sort({ points: -1 }).limit(10).select("name points avatar");
    const regionDistribution = await Food.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { usersByMonth, topUsersByPoints, regionDistribution } });
  } catch (err) {
    next(err);
  }
};

// ---------- SETTINGS (singleton, lưu bền vững vào MongoDB) ----------
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: "global" });
    if (!settings) settings = await Settings.create({ key: "global" });
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const allowed = ["siteName", "maintenanceMode", "aiModel", "pushNotificationsEnabled", "contactEmail"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserActive,
  createFood,
  updateFood,
  deleteFood,
  getRestaurantsAdmin,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getProvincesAdmin,
  updateProvince,
  getReviewsAdmin,
  deleteReview,
  getReports,
  resolveReport,
  getCommunityPostsAdmin,
  deleteCommunityPost,
  getAiLogs,
  getAnalytics,
  getSettings,
  updateSettings,
};
