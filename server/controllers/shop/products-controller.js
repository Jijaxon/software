const Product = require("../../models/Product");

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

    let filters = {};

    // category bo'sh bo'lmasa, split qilib arrayga aylantiramiz
    if (category) {
      filters.category = { $in: category.split(",") };
    }

    // brand bo'sh bo'lmasa, split qilib arrayga aylantiramiz
    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }

    // sortni aniqlash
    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    // ma'lumotlarni filtr va sort bilan olish
    const products = await Product.find(filters).sort(sort);

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
    const product = await Product.findById(id);

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