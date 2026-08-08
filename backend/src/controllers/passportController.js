const Passport = require("../models/Passport");

const BADGE_TIERS = [
  { tier: "Bronze", min: 5 },
  { tier: "Silver", min: 15 },
  { tier: "Gold", min: 30 },
  { tier: "Diamond", min: 63 },
];

const getMyPassport = async (req, res, next) => {
  try {
    let passport = await Passport.findOne({ user: req.user._id })
      .populate("exploredProvinces.province", "name slug region")
      .populate("eatenFoods.food", "name images slug");
    if (!passport) passport = await Passport.create({ user: req.user._id });
    res.json({ success: true, data: passport });
  } catch (err) {
    next(err);
  }
};

const checkinProvince = async (req, res, next) => {
  try {
    const { provinceId, lat, lng, name } = req.body;
    let passport = await Passport.findOne({ user: req.user._id });
    if (!passport) passport = await Passport.create({ user: req.user._id });

    const already = passport.exploredProvinces.some((p) => String(p.province) === provinceId);
    if (!already) {
      passport.exploredProvinces.push({ province: provinceId });
      passport.points += 50;
    }
    passport.checkins.push({ name, province: provinceId, lat, lng });

    const exploredCount = passport.exploredProvinces.length;
    const eligibleBadge = [...BADGE_TIERS].reverse().find((b) => exploredCount >= b.min);
    if (eligibleBadge && !passport.badges.some((b) => b.tier === eligibleBadge.tier)) {
      passport.badges.push({ name: `Nhà thám hiểm ${eligibleBadge.tier}`, tier: eligibleBadge.tier });
    }

    await passport.save();
    res.json({ success: true, data: passport });
  } catch (err) {
    next(err);
  }
};

const markFoodEaten = async (req, res, next) => {
  try {
    const { foodId } = req.body;
    let passport = await Passport.findOne({ user: req.user._id });
    if (!passport) passport = await Passport.create({ user: req.user._id });
    const already = passport.eatenFoods.some((f) => String(f.food) === foodId);
    if (!already) {
      passport.eatenFoods.push({ food: foodId });
      passport.points += 10;
    }
    await passport.save();
    res.json({ success: true, data: passport });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyPassport, checkinProvince, markFoodEaten };
