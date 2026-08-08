const express = require("express");
const {
  getFeed, createPost, toggleLike, addComment, toggleFollow, getLeaderboard,
} = require("../controllers/communityController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/feed", getFeed);
router.post("/posts", protect, createPost);
router.post("/posts/:id/like", protect, toggleLike);
router.post("/posts/:id/comment", protect, addComment);
router.post("/follow/:userId", protect, toggleFollow);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
