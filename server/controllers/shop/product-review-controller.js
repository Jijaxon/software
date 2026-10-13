const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");

const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;

    const order = (await pool.query(
      'SELECT id FROM orders WHERE user_id = $1 AND cart_items @> $2::jsonb LIMIT 1',
      [userId, JSON.stringify([{ productId }])]
    )).rows[0];

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase product to review it.",
      });
    }

    const checkExistinfReview = (await pool.query(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2', [productId, userId]
    )).rows[0];

    if (checkExistinfReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    const newReview = toRecord((await pool.query(
      `INSERT INTO reviews (product_id, user_id, user_name, review_message, review_value)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [productId, userId, userName, reviewMessage, reviewValue]
    )).rows[0]);
    const averageReview = (await pool.query(
      'SELECT AVG(review_value)::float AS average FROM reviews WHERE product_id = $1', [productId]
    )).rows[0].average;
    await pool.query('UPDATE products SET average_review = $1, updated_at = NOW() WHERE id = $2', [averageReview, productId]);

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const { rows } = await pool.query(
      `SELECT r.*, CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object('id', u.id, '_id', u.id, 'username', u.username, 'email', u.email) END AS user_id
       FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [productId]
    );
    const reviews = toRecords(rows);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { addProductReview, getProductReviews };