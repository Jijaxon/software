const express = require("express");
const { upload } = require("../../middleware/upload");
const { authMiddleware, adminMiddleware } = require("../../middleware/auth");
const { createTaxonomyController } = require("../../controllers/admin/taxonomy-controller");

const { getAll, create, update, remove } = createTaxonomyController({
  table: "brands",
  uploadDir: "brands",
});

const router = express.Router();

// Ro'yxatni olish ochiq (shop uchun ham kerak)
router.get("/", getAll);

// O'zgartirishlar faqat admin uchun
router.post("/add", authMiddleware, adminMiddleware, upload.single("brand_image"), create);
router.put("/update/:id", authMiddleware, adminMiddleware, upload.single("brand_image"), update);
router.delete("/delete/:id", authMiddleware, adminMiddleware, remove);

module.exports = router;
