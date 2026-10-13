const { pool } = require('../../db');
const { toRecord } = require('../../db/records');

async function getCart(userId, includeProducts = false) {
  const cart = toRecord((await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId])).rows[0]);
  if (!cart) return null;
  if (includeProducts) {
    const { rows } = await pool.query(
      `SELECT ci.product_id, ci.quantity, p.image, p.title, p.price, p.sale_price
       FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1 ORDER BY ci.id`,
      [cart.id]
    );
    cart.items = rows.map((item) => ({
      productId: item.product_id,
      image: item.image,
      title: item.title,
      price: Number(item.price),
      salePrice: Number(item.sale_price),
      quantity: item.quantity,
    }));
  } else {
    cart.items = (await pool.query('SELECT product_id AS "productId", quantity FROM cart_items WHERE cart_id = $1', [cart.id])).rows;
  }
  return cart;
}

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !Number.isInteger(Number(quantity)) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid data provided!' });
    }
    const product = (await pool.query('SELECT id FROM products WHERE id = $1', [productId])).rows[0];
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const cart = (await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW() RETURNING id', [userId]
    )).rows[0];
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cart.id, productId, quantity]
    );
    res.status(200).json({ success: true, data: await getCart(userId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: 'User id is manadatory!' });
    const cart = await getCart(userId, true);
    if (!cart) return res.status(200).json({ success: false, message: 'Cart not found!' });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !Number.isInteger(Number(quantity)) || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid data provided!' });
    }
    const cart = (await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId])).rows[0];
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found!' });
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3', [quantity, cart.id, productId]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Cart item not present !' });
    res.status(200).json({ success: true, data: await getCart(userId, true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) return res.status(400).json({ success: false, message: 'Invalid data provided!' });
    const cart = (await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId])).rows[0];
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found!' });
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cart.id, productId]);
    res.status(200).json({ success: true, data: await getCart(userId, true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error' });
  }
};

const clearCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: 'User id is mandatory!' });
    const cart = (await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId])).rows[0];
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found!' });
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.status(200).json({ success: true, message: 'All cart items cleared successfully!', data: await getCart(userId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error clearing cart!' });
  }
};

module.exports = { addToCart, updateCartItemQty, deleteCartItem, fetchCartItems, clearCartItems };