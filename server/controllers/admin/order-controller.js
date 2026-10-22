const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const { notifyOrderStatus } = require("../../telegram/notify");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object('id', u.id, '_id', u.id, 'username', u.username, 'email', u.email, 'phone', u.phone) END AS user_id
       FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`
    );
    const orders = toRecords(rows);

    if (!orders.length) {
      return res.status(200).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT o.*, CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object('id', u.id, '_id', u.id, 'username', u.username, 'email', u.email, 'phone', u.phone) END AS user_id
       FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = $1`, [id]
    );
    const order = toRecord(rows[0]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const ORDER_STATUSES = ["pending", "confirmed", "inProcess", "inShipping", "delivered", "rejected"];

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Noto'g'ri holat" });
    }

    const order = toRecord((await pool.query('SELECT * FROM orders WHERE id = $1', [id])).rows[0]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await pool.query('UPDATE orders SET order_status = $1, order_update_date = NOW(), updated_at = NOW() WHERE id = $2', [orderStatus, id]);

    // Holat haqiqatan o'zgarganda mijozga Telegram orqali xabar beramiz
    let notified = false;
    if (order.orderStatus !== orderStatus) {
      notified = await notifyOrderStatus(order, orderStatus);
    }

    res.status(200).json({
      success: true,
      notified,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};