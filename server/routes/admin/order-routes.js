const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");
const { authMiddleware, adminMiddleware } = require("../../middleware/auth");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);

module.exports = router;