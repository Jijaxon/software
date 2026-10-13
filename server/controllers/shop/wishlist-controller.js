const { pool } = require('../../db');
const { toRecord } = require('../../db/records');

async function getWishlist(userId, includeProducts = false) {
  const wishlist = toRecord((await pool.query('SELECT * FROM wishlists WHERE user_id = $1', [userId])).rows[0]);
  if (!wishlist) return null;
  const query = includeProducts
    ? `SELECT wi.product_id, p.image, p.title, p.price, p.sale_price FROM wishlist_items wi
       JOIN products p ON p.id = wi.product_id WHERE wi.wishlist_id = $1 ORDER BY wi.id`
    : 'SELECT product_id AS "productId" FROM wishlist_items WHERE wishlist_id = $1';
  const { rows } = await pool.query(query, [wishlist.id]);
  wishlist.items = includeProducts ? rows.map((item) => ({
    productId: item.product_id,
    image: item.image,
    title: item.title,
    price: Number(item.price),
    salePrice: Number(item.sale_price),
  })) : rows;
  return wishlist;
}

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ success: false, message: 'Invalid data provided!' });
    const product = (await pool.query('SELECT id FROM products WHERE id = $1', [productId])).rows[0];
    if (!product) return res.status(404).json({ success: false, message: 'Product not found!' });
    const wishlist = (await pool.query(
      'INSERT INTO wishlists (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW() RETURNING id', [userId]
    )).rows[0];
    const result = await pool.query(
      'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [wishlist.id, productId]
    );
    if (!result.rowCount) return res.status(200).json({ success: false, message: 'Product already in wishlist!' });
    res.status(200).json({ success: true, data: await getWishlist(userId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const fetchWishlistItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: 'User id is mandatory!' });
    const wishlist = await getWishlist(userId, true);
    if (!wishlist) return res.status(200).json({ success: false, message: 'Wishlist not found!' });
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) return res.status(400).json({ success: false, message: 'Invalid data provided!' });
    const wishlist = (await pool.query('SELECT id FROM wishlists WHERE user_id = $1', [userId])).rows[0];
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found!' });
    await pool.query('DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2', [wishlist.id, productId]);
    res.status(200).json({ success: true, message: 'Item removed from wishlist.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

module.exports = { addToWishlist, fetchWishlistItems, deleteWishlistItem };