const express = require("express");
const { authMiddleware } = require("../../middleware/auth");

const {
  quoteOrder,
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  confirmPayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// Narx tarkibi (savat + promokod + bonus + yetkazish) — server hisoblaydi
router.post("/quote", authMiddleware, quoteOrder);

// Stripe checkout session yaratish (foydalanuvchi tokendan olinadi)
router.post("/create", authMiddleware, createOrder);

// To'lovni tasdiqlash (Stripe success sahifasidan so'ng)
router.post("/confirm-payment", authMiddleware, confirmPayment);

// Foydalanuvchi buyurtmalari
router.get("/list/:userId", getAllOrdersByUser);

// Bitta buyurtma tafsiloti
router.get("/details/:id", getOrderDetails);

module.exports = router;
