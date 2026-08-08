const express = require("express");
const {
  getFoods, getFoodById, explainFoodWithAI, toggleBookmark, getTrending,
} = require("../controllers/foodController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/trending", getTrending);
router.get("/", getFoods);
router.get("/:id", getFoodById);
router.get("/:id/ai-explain", explainFoodWithAI);
router.post("/:id/bookmark", protect, toggleBookmark);

module.exports = router;
