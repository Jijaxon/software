const express = require("express");
const { authMiddleware } = require("../../middleware/auth");
const { getPublicSettings, getReferralInfo } = require("../../controllers/shop/growth-controller");

const router = express.Router();

router.get("/settings", getPublicSettings);
router.get("/referral", authMiddleware, getReferralInfo);

module.exports = router;
