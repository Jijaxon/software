const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const { deleteFiles } = require("../../middleware/upload");

function formatPhone(phone) {
  const match = /^998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone || "");
  return match ? `+998 ${match[1]} ${match[2]} *** ${match[4]}` : "Mijoz";
}

const addProductReview = async (req, res) => {
  const uploaded = (req.files || []).map((file) => `/uploads/reviews/${file.filename}`);
  try {
    const userId = req.user.id;
    const { productId, reviewMessage } = req.body;
    const reviewValue = Number(req.body.reviewValue);

    if (!productId || !(reviewValue >= 1 && reviewValue <= 5)) {
      await deleteFiles(uploaded);
      return res.status(400).json({ success: false, message: "Baho 1 dan 5 gacha bo'lishi kerak" });
    }

    // Faqat mahsulotni haqiqatan sotib olgan (to'lagan) mijoz sharh qoldira oladi
    const order = (await pool.query(
      `SELECT id FROM orders WHERE user_id = $1 AND payment_status = 'paid' AND cart_items @> $2::jsonb LIMIT 1`,
      [userId, JSON.stringify([{ productId }])]
    )).rows[0];

    if (!order) {
      await deleteFiles(uploaded);
      return res.status(403).json({
        success: false,
        message: "Fikr qoldirish uchun avval mahsulotni sotib olishingiz kerak",
      });
    }

    const existing = (await pool.query(
      "SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2", [productId, userId]
    )).rows[0];

    if (existing) {
      await deleteFiles(uploaded);
      return res.status(400).json({ success: false, message: "Siz bu mahsulotga fikr qoldirgansiz" });
    }

    const user = (await pool.query("SELECT username, phone FROM users WHERE id = $1", [userId])).rows[0];
    const userName = user?.username || formatPhone(user?.phone);

    const newReview = toRecord((await pool.query(
      `INSERT INTO reviews (product_id, user_id, user_name, review_message, review_value, images)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
      [productId, userId, userName, String(reviewMessage || "").slice(0, 1000), reviewValue, JSON.stringify(uploaded)]
    )).rows[0]);

    const averageReview = (await pool.query(
      "SELECT AVG(review_value)::float AS average FROM reviews WHERE product_id = $1", [productId]
    )).rows[0].average;
    await pool.query("UPDATE products SET average_review = $1, updated_at = NOW() WHERE id = $2", [averageReview, productId]);

    res.status(201).json({ success: true, data: newReview });
  } catch (e) {
    console.log(e);
    await deleteFiles(uploaded);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const { rows } = await pool.query(
      `SELECT r.*, CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object('id', u.id, '_id', u.id, 'username', u.username) END AS user_id
       FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
      [productId]
    );
    res.status(200).json({ success: true, data: toRecords(rows) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = { addProductReview, getProductReviews };
