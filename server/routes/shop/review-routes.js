const express = require("express");
const { upload } = require("../../middleware/upload");
const { authMiddleware } = require("../../middleware/auth");

const {
  addProductReview,
  getProductReviews,
} = require("../../controllers/shop/product-review-controller");

const router = express.Router();

// 3 tagacha rasm bilan sharh
router.post("/add", authMiddleware, upload.array("review_images", 3), addProductReview);
router.get("/:productId", getProductReviews);

module.exports = router;
