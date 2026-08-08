const express = require("express");
const { getProvinces, getProvinceBySlug, getProvinceAIStory } = require("../controllers/provinceController");

const router = express.Router();

router.get("/", getProvinces);
router.get("/:slug", getProvinceBySlug);
router.get("/:slug/ai-story", getProvinceAIStory);

module.exports = router;
