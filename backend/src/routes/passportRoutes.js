const express = require("express");
const { getMyPassport, checkinProvince, markFoodEaten } = require("../controllers/passportController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, getMyPassport);
router.post("/checkin", protect, checkinProvince);
router.post("/eaten", protect, markFoodEaten);

module.exports = router;
