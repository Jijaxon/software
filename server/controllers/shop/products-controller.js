const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");

// const getFilteredProducts = async (req, res) => {
//   try {
//     const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;
//
//     let filters = {};
//
//     if (category.length) {
//       filters.category = { $in: category.split(",") };
//     }
//
//     if (brand.length) {
//       filters.brand = { $in: brand.split(",") };
//     }
//
//     let sort = {};
//
//     switch (sortBy) {
//       case "price-lowtohigh":
//         sort.price = 1;
//
//         break;
//       case "price-hightolow":
//         sort.price = -1;
//
//         break;
//       case "title-atoz":
//         sort.title = 1;
//
//         break;
//
//       case "title-ztoa":
//         sort.title = -1;
//
//         break;
//
//       default:
//         sort.price = 1;
//         break;
//     }
//
//     const products = await Product.find(filters).sort(sort);
//
//     res.status(200).json({
//       success: true,
//       data: products,
//     });
//   } catch (e) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Some error occured",
//     });
//   }
// };

const getFilteredProducts = async (req, res) => {
  try {
    // Querylarni string sifatida olamiz va agar bo'sh bo'lsa "" qabul qilamiz
    let { category = "", brand = "", sortBy = "price-lowtohigh" } = req.query;

    const conditions = [];
    const params = [];
    if (category) {
      params.push(category.split(","));
      conditions.push(`category = ANY($${params.length}::text[])`);
    }
    if (brand) {
      params.push(brand.split(","));
      conditions.push(`brand = ANY($${params.length}::text[])`);
    }
    let sort;
    switch (sortBy) {
      case "price-lowtohigh":
        sort = 'price ASC';
        break;
      case "price-hightolow":
        sort = 'price DESC';
        break;
      case "title-atoz":
        sort = 'title ASC';
        break;
      case "title-ztoa":
        sort = 'title DESC';
        break;
      case "popular":
        sort = 'sold_count DESC, created_at DESC';
        break;
      case "rating":
        sort = 'average_review DESC NULLS LAST, sold_count DESC';
        break;
      case "newest":
        sort = 'created_at DESC';
        break;
      default:
        sort = 'price ASC';
        break;
    }

    // ma'lumotlarni filtr va sort bilan olish
    const products = toRecords((await pool.query(
      `SELECT * FROM products ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY ${sort}`,
      params
    )).rows);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};


const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = toRecord((await pool.query('SELECT * FROM products WHERE id = $1', [id])).rows[0]);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };