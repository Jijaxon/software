const User = require("../../models/User");
const Product = require("../../models/Product");
const Order = require("../../models/Order");

async function dashboard(req, res) {
  try {
    // USERS
    const totalUsers = await User.countDocuments();

    // PRODUCTS
    const totalProducts = await Product.countDocuments();

    // ORDERS
    const totalOrders = await Order.countDocuments();

    // REVENUE (faqat paid buyurtmalar)
    const paidOrders = await Order.find({ paymentStatus: "paid" });
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    // ORDER STATUS COUNT
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // MONTHLY SALES (monthName + totalSales ONLY)
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $addFields: {
          monthName: {
            $arrayElemAt: [
              [
                "",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ],
              "$_id",
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,       // REMOVE _id
          monthName: 1, // KEEP month
          totalSales: 1 // KEEP total sales
        },
      },
    ]);

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      monthlySales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
}

module.exports = {dashboard};
