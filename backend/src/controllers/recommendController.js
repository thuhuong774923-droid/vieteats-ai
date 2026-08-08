const aiService = require("../services/aiService");

const getRecommendations = async (req, res, next) => {
  try {
    const { budget, region, limit } = req.query;
    const preferences = req.user?.preferences || {};
    const foods = await aiService.recommendFoods({
      preferences,
      budget: budget ? Number(budget) : undefined,
      region,
      limit: limit ? Number(limit) : 10,
    });
    res.json({ success: true, data: foods });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
