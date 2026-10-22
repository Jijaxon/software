const express = require("express");
const { productSharePage, sitemap } = require("../../controllers/shop/seo-controller");

const router = express.Router();

router.get("/product/:id", productSharePage);
router.get("/sitemap.xml", sitemap);

module.exports = router;
