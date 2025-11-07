const express = require('express')
const {upload} = require( "../../middleware/upload");
const {addProduct, fetchAllProducts, deleteProduct, editProduct} = require("../../controllers/admin/products-controller")

const router = express.Router();

router.get("/", fetchAllProducts)
router.delete("/delete/:id", deleteProduct);
router.post("/add", upload.single("product_image"), addProduct);
router.put("/update/:id", upload.single("product_image"), editProduct);

module.exports = router;
