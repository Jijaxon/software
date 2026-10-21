const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage
} = require("../../controllers/common/feature-controller");
const {upload} = require("../../middleware/upload");
const {authMiddleware, adminMiddleware} = require("../../middleware/auth");

const router = express.Router();

router.post("/add", authMiddleware, adminMiddleware, upload.single("banner"), addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteFeatureImage);

module.exports = router;