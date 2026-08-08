const CommunityPost = require("../models/CommunityPost");
const User = require("../models/User");

const getFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, hashtag } = req.query;
    const filter = {};
    if (hashtag) filter.hashtags = hashtag;
    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .populate("user", "name avatar")
        .populate("relatedFood", "name images slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CommunityPost.countDocuments(filter),
    ]);
    res.json({ success: true, data: posts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await CommunityPost.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Không tìm thấy bài đăng" });
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Không tìm thấy bài đăng" });
    post.comments.push({ user: req.user._id, content: req.body.content });
    await post.save();
    res.status(201).json({ success: true, data: post.comments });
  } catch (err) {
    next(err);
  }
};

const toggleFollow = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    const me = await User.findById(req.user._id);
    const idx = me.following.indexOf(targetUser._id);
    if (idx > -1) {
      me.following.splice(idx, 1);
      targetUser.followers.splice(targetUser.followers.indexOf(me._id), 1);
    } else {
      me.following.push(targetUser._id);
      targetUser.followers.push(me._id);
    }
    await me.save();
    await targetUser.save();
    res.json({ success: true, following: idx === -1 });
  } catch (err) {
    next(err);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(20).select("name avatar points");
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeed, createPost, toggleLike, addComment, toggleFollow, getLeaderboard };
