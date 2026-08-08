const express = require("express");
const { getReviews, createReview, likeReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, createReview);
router.post("/:id/like", protect, likeReview);

module.exports = router;
