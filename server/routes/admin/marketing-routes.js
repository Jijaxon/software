const express = require("express");
const { upload } = require("../../middleware/upload");
const { authMiddleware, adminMiddleware } = require("../../middleware/auth");
const {
  getAdminSettings,
  saveAdminSettings,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listBroadcasts,
  createBroadcast,
} = require("../../controllers/admin/marketing-controller");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/settings", getAdminSettings);
router.put("/settings", saveAdminSettings);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

router.get("/broadcasts", listBroadcasts);
router.post("/broadcasts", upload.single("broadcast_image"), createBroadcast);

module.exports = router;
