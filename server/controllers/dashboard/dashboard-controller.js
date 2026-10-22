const { pool } = require("../../db");
const { toRecords } = require("../../db/records");
const { getSettings } = require("../../services/settings");

const PAID = "payment_status = 'paid'";

async function dashboard(req, res) {
  try {
    const settings = await getSettings();
    const lowStockThreshold = Number(settings.low_stock_threshold) || 5;

    const totals = (await pool.query(
      `SELECT (SELECT COUNT(*) FROM users WHERE role <> 'admin')::int AS total_users,
       (SELECT COUNT(*) FROM products)::int AS total_products,
       (SELECT COUNT(*) FROM orders WHERE ${PAID})::int AS total_orders,
       COALESCE((SELECT SUM(total_amount) FROM orders WHERE ${PAID}), 0)::float AS total_revenue,
       COALESCE((SELECT AVG(total_amount) FROM orders WHERE ${PAID}), 0)::float AS average_order`
    )).rows[0];

    // Bugun / shu hafta / shu oy (daromad va buyurtmalar soni)
    const periods = (await pool.query(
      `SELECT
         COALESCE(SUM(total_amount) FILTER (WHERE order_date >= date_trunc('day', NOW())), 0)::float AS today_revenue,
         COUNT(*) FILTER (WHERE order_date >= date_trunc('day', NOW()))::int AS today_orders,
         COALESCE(SUM(total_amount) FILTER (WHERE order_date >= date_trunc('week', NOW())), 0)::float AS week_revenue,
         COUNT(*) FILTER (WHERE order_date >= date_trunc('week', NOW()))::int AS week_orders,
         COALESCE(SUM(total_amount) FILTER (WHERE order_date >= date_trunc('month', NOW())), 0)::float AS month_revenue,
         COUNT(*) FILTER (WHERE order_date >= date_trunc('month', NOW()))::int AS month_orders,
         COALESCE(SUM(total_amount) FILTER (WHERE order_date >= date_trunc('month', NOW()) - INTERVAL '1 month'
                                              AND order_date < date_trunc('month', NOW())), 0)::float AS prev_month_revenue
       FROM orders WHERE ${PAID}`
    )).rows[0];

    // Oxirgi 30 kunlik kunlik daromad (bo'sh kunlar 0 bilan)
    const daily = await pool.query(
      `SELECT TO_CHAR(d.day, 'DD.MM') AS "date",
              COALESCE(SUM(o.total_amount), 0)::float AS "revenue",
              COUNT(o.id)::int AS "orders"
       FROM generate_series(date_trunc('day', NOW()) - INTERVAL '29 days', date_trunc('day', NOW()), INTERVAL '1 day') AS d(day)
       LEFT JOIN orders o ON o.${PAID} AND date_trunc('day', o.order_date) = d.day
       GROUP BY d.day ORDER BY d.day`
    );

    const statuses = await pool.query(
      `SELECT order_status AS _id, COUNT(*)::int AS count FROM orders WHERE ${PAID} GROUP BY order_status`
    );

    const sales = await pool.query(
      `SELECT TO_CHAR(MAKE_DATE(2000, EXTRACT(MONTH FROM order_date)::int, 1), 'FMMonth') AS "monthName",
       SUM(total_amount)::float AS "totalSales" FROM orders
       WHERE ${PAID} AND order_date >= date_trunc('month', NOW()) - INTERVAL '11 months'
       GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date)
       ORDER BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date)`
    );

    const topProducts = await pool.query(
      `SELECT id, title, image, sold_count, total_stock, price, average_review FROM products
       WHERE sold_count > 0 ORDER BY sold_count DESC LIMIT 5`
    );

    const lowStock = await pool.query(
      `SELECT id, title, image, total_stock FROM products
       WHERE total_stock <= $1 ORDER BY total_stock ASC, title ASC LIMIT 10`,
      [lowStockThreshold]
    );

    const marketing = (await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM coupon_redemptions)::int AS coupon_uses,
         COALESCE((SELECT SUM(discount_amount) FROM coupon_redemptions), 0)::float AS coupon_discount,
         (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL)::int AS referred_users,
         COALESCE((SELECT SUM(amount) FROM bonus_transactions WHERE amount > 0), 0)::float AS bonus_issued,
         (SELECT COUNT(DISTINCT c.id) FROM carts c JOIN cart_items ci ON ci.cart_id = c.id
            WHERE c.updated_at < NOW() - INTERVAL '1 hour')::int AS abandoned_carts,
         (SELECT COUNT(*) FROM users WHERE verify AND telegram_chat_id IS NOT NULL AND marketing_opt_in)::int AS telegram_audience`
    )).rows[0];

    res.status(200).json({
      totalUsers: totals.total_users,
      totalProducts: totals.total_products,
      totalOrders: totals.total_orders,
      totalRevenue: totals.total_revenue,
      averageOrder: totals.average_order,
      periods: {
        todayRevenue: periods.today_revenue,
        todayOrders: periods.today_orders,
        weekRevenue: periods.week_revenue,
        weekOrders: periods.week_orders,
        monthRevenue: periods.month_revenue,
        monthOrders: periods.month_orders,
        prevMonthRevenue: periods.prev_month_revenue,
      },
      dailySales: daily.rows,
      ordersByStatus: statuses.rows,
      monthlySales: sales.rows,
      topProducts: toRecords(topProducts.rows),
      lowStock: toRecords(lowStock.rows),
      lowStockThreshold,
      marketing: {
        couponUses: marketing.coupon_uses,
        couponDiscount: marketing.coupon_discount,
        referredUsers: marketing.referred_users,
        bonusIssued: marketing.bonus_issued,
        abandonedCarts: marketing.abandoned_carts,
        telegramAudience: marketing.telegram_audience,
      },
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
