const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../../db');
const { toRecord, toRecords } = require('../../db/records');

// Narxlar bazada so'mda saqlanadi. Stripe valyutasi .env orqali tanlanadi:
// STRIPE_CURRENCY=uzs (standart) yoki usd (UZS_PER_USD kursi bo'yicha hisoblanadi)
const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'uzs').toLowerCase();
const UZS_PER_USD = Number(process.env.UZS_PER_USD) || 12700;

function toStripeAmount(amountInUzs) {
  const amount = STRIPE_CURRENCY === 'uzs' ? amountInUzs : amountInUzs / UZS_PER_USD;
  return Math.round(amount * 100);
}

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, paymentMethod, totalAmount, cartId } = req.body;
    if (!Array.isArray(cartItems) || !cartItems.length) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: { name: item.title },
          unit_amount: toStripeAmount(Number(item.price) * (1 - Number(item.salePrice || 0) / 100)),
        },
        quantity: item.quantity,
      })),
      success_url: 'http://localhost:5173/shop/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/shop/cancel',
      ...(addressInfo?.email ? { customer_email: addressInfo.email } : {}),
    });
    const newOrder = toRecord((await pool.query(
      `INSERT INTO orders (user_id, cart_id, cart_items, address_info, order_status, payment_method,
       payment_status, total_amount, order_date, order_update_date, payment_id)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, 'pending', $5, 'pending', $6, NOW(), NOW(), $7) RETURNING *`,
      [userId || null, cartId || null, JSON.stringify(cartItems), JSON.stringify(addressInfo || {}),
        paymentMethod || 'stripe', totalAmount, session.id]
    )).rows[0]);
    res.status(201).json({ success: true, url: session.url, orderId: newOrder.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ success: false, message: 'Error while creating Stripe checkout session' });
  }
};

const confirmPayment = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    const { sessionId, orderId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
    await client.query('BEGIN');
    transactionStarted = true;
    const order = toRecord((await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId])).rows[0]);
    if (!order) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      await client.query('COMMIT');
      transactionStarted = false;
      return res.status(200).json({ success: true, message: 'Order confirmed', data: order });
    }
    for (const item of order.cartItems) {
      const stockUpdate = await client.query(
        'UPDATE products SET total_stock = total_stock - $1, updated_at = NOW() WHERE id = $2 AND total_stock >= $1',
        [item.quantity, item.productId]
      );
      if (!stockUpdate.rowCount) throw new Error(`Insufficient stock for product ${item.productId}`);
    }
    await client.query(
      `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', payment_id = $1,
       order_update_date = NOW(), updated_at = NOW() WHERE id = $2`,
      [session.payment_intent, order.id]
    );
    if (order.cartId) await client.query('DELETE FROM carts WHERE id = $1', [order.cartId]);
    await client.query('COMMIT');
    transactionStarted = false;
    const updatedOrder = toRecord((await pool.query('SELECT * FROM orders WHERE id = $1', [order.id])).rows[0]);
    res.status(200).json({ success: true, message: 'Order confirmed', data: updatedOrder });
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Error confirming payment' });
  } finally {
    client.release();
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = toRecords((await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]
    )).rows);
    if (!orders.length) return res.status(404).json({ success: false, message: 'No orders found' });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Some error occurred' });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = toRecord((await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id])).rows[0]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Some error occurred' });
  }
};

module.exports = { createOrder, confirmPayment, getAllOrdersByUser, getOrderDetails };