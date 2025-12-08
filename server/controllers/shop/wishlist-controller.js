const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const exists = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (exists) {
      return res.status(200).json({
        success: false,
        message: "Product already in wishlist!",
      });
    }

    wishlist.items.push({ productId });
    await wishlist.save();

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!wishlist) {
      return res.status(200).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    const items = wishlist.items
      .filter((i) => i.productId)
      .map((item) => ({
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
      }));

    res.status(200).json({
      success: true,
      data: {
        ...wishlist._doc,
        items,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found!",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToWishlist,
  fetchWishlistItems,
  deleteWishlistItem,
};


