const { pool } = require("../../db");

async function dashboard(req, res) {
  try {
    const totals = (await pool.query(
      `SELECT (SELECT COUNT(*) FROM users)::int AS total_users,
       (SELECT COUNT(*) FROM products)::int AS total_products,
       (SELECT COUNT(*) FROM orders)::int AS total_orders,
       COALESCE((SELECT SUM(total_amount) FROM orders WHERE payment_status = 'paid'), 0)::float AS total_revenue`
    )).rows[0];
    const statuses = await pool.query(
      'SELECT order_status AS _id, COUNT(*)::int AS count FROM orders GROUP BY order_status'
    );
    const sales = await pool.query(
      `SELECT TO_CHAR(MAKE_DATE(2000, EXTRACT(MONTH FROM order_date)::int, 1), 'FMMonth') AS "monthName",
       SUM(total_amount)::float AS "totalSales" FROM orders WHERE order_date IS NOT NULL
       GROUP BY EXTRACT(MONTH FROM order_date) ORDER BY EXTRACT(MONTH FROM order_date)`
    );

    res.status(200).json({
      totalUsers: totals.total_users,
      totalProducts: totals.total_products,
      totalOrders: totals.total_orders,
      totalRevenue: totals.total_revenue,
      ordersByStatus: statuses.rows,
      monthlySales: sales.rows,
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
