const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const {deleteFiles} = require("../../middleware/upload");

// Bo'sh/noto'g'ri qiymatlarni NUMERIC ustunlar uchun null ga aylantiradi
// ("" yoki undefined NUMERIC ga yozilsa Postgres xato beradi)
function toNum(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// Chegirma tugash vaqti: bo'sh/"null" -> null, aks holda ISO sana
function toDate(value) {
  if (value === "" || value === null || value === undefined || value === "null" || value === "undefined") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    // Chegirma bo'lmasa tugash vaqti ham saqlanmaydi
    const saleEndsAt = toNum(salePrice) > 0 ? toDate(req.body.saleEndsAt) : null;

    const newlyCreatedProduct = toRecord((await pool.query(
      `INSERT INTO products (image, title, description, category, brand, price, sale_price, total_stock, average_review, sale_ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [imagePath, title, description, category, brand, toNum(price), toNum(salePrice), toNum(totalStock), toNum(averageReview), saleEndsAt]
    )).rows[0]);
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = toRecords((await pool.query('SELECT * FROM products ORDER BY created_at DESC')).rows);
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const {id} = req.params;
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    let findProduct = toRecord((await pool.query('SELECT * FROM products WHERE id = $1', [id])).rows[0]);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let newImagePath = null;
    if (req.file) {
      // agar upload.single("product_image") ishlatayotgan bo‘lsang
      newImagePath = `/uploads/products/${req.file.filename}`;

      // eski rasmni o‘chir
      if (findProduct.image) {
        await deleteFiles([findProduct.image]);
      }

      findProduct.image = newImagePath;
    }

    const nextSalePrice = salePrice === "" ? 0 : (toNum(salePrice) ?? findProduct.salePrice);
    // saleEndsAt yuborilgan bo'lsa yangilaymiz (bo'sh qiymat — muddatsiz); chegirma yo'q bo'lsa — null
    const nextSaleEndsAt = !(nextSalePrice > 0)
      ? null
      : ("saleEndsAt" in req.body ? toDate(req.body.saleEndsAt) : findProduct.saleEndsAt);

    findProduct = toRecord((await pool.query(
      `UPDATE products SET image = $1, title = $2, description = $3, category = $4, brand = $5,
       price = $6, sale_price = $7, total_stock = $8, average_review = $9, sale_ends_at = $10, updated_at = NOW()
       WHERE id = $11 RETURNING *`,
      [newImagePath || findProduct.image, title || findProduct.title, description || findProduct.description,
        category || findProduct.category, brand || findProduct.brand,
        toNum(price) ?? findProduct.price,
        nextSalePrice,
        toNum(totalStock) ?? findProduct.totalStock,
        toNum(averageReview) ?? findProduct.averageReview, nextSaleEndsAt, id]
    )).rows[0]);
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const {id} = req.params;

    const product = toRecord((await pool.query('SELECT * FROM products WHERE id = $1', [id])).rows[0]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.image) {
      const filePaths = Array.isArray(product.image) ? product.image : [product.image];

      console.log(filePaths)

      await deleteFiles(filePaths);
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  // handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};