const express = require("express");
const {
  getDashboardStats, getUsers, updateUserRole, toggleUserActive,
  createFood, updateFood, deleteFood,
  getRestaurantsAdmin, createRestaurant, updateRestaurant, deleteRestaurant,
  getProvincesAdmin, updateProvince,
  getReviewsAdmin, deleteReview,
  getReports, resolveReport,
  getCommunityPostsAdmin, deleteCommunityPost,
  getAiLogs, getAnalytics,
  getSettings, updateSettings,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(protect, authorize("admin", "moderator"));

router.get("/dashboard", getDashboardStats);
router.get("/analytics", getAnalytics);

router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/toggle-active", toggleUserActive);

router.post("/foods", createFood);
router.put("/foods/:id", updateFood);
router.delete("/foods/:id", deleteFood);

router.get("/restaurants", getRestaurantsAdmin);
router.post("/restaurants", createRestaurant);
router.put("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

router.get("/locations", getProvincesAdmin);
router.put("/locations/:id", updateProvince);

router.get("/reviews", getReviewsAdmin);
router.delete("/reviews/:id", deleteReview);

router.get("/reports", getReports);
router.post("/reports/:id/resolve", resolveReport);

router.get("/community", getCommunityPostsAdmin);
router.delete("/community/:id", deleteCommunityPost);

router.get("/ai-logs", getAiLogs);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
