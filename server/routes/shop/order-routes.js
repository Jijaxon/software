// const express = require("express");
//
// const {
//   createOrder,
//   getAllOrdersByUser,
//   getOrderDetails,
//   confirmPayment,
// } = require("../../controllers/shop/order-controller");
//
// const router = express.Router();
//
// router.post("/create", createOrder);
// router.post("/capture", confirmPayment);
// router.get("/list/:userId", getAllOrdersByUser);
// router.get("/details/:id", getOrderDetails);
//
// module.exports = router;

const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  confirmPayment, // Stripe uchun tasdiqlash
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// 🧾 1. Stripe checkout session yaratish
router.post("/create", createOrder);

// 💳 2. To‘lovni tasdiqlash (Stripe success sahifasidan so‘ng)
router.post("/confirm-payment", confirmPayment);

// 📦 3. Foydalanuvchi buyurtmalari
router.get("/list/:userId", getAllOrdersByUser);

// 🔍 4. Bitta buyurtma tafsiloti
router.get("/details/:id", getOrderDetails);

module.exports = router;
