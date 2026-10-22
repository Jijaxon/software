const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../../db');
const { toRecord, toRecords } = require('../../db/records');
const { calculateOrder } = require('../../services/pricing');
const { finalizeOrder } = require('../../services/orders');
const { notifyOrderPaid, notifyUser, linkButton, CLIENT_URL } = require('../../telegram/notify');
const { formatSom } = require('../../services/pricing');

// Narxlar bazada so'mda saqlanadi. Stripe valyutasi .env orqali tanlanadi:
// STRIPE_CURRENCY=uzs (standart) yoki usd (UZS_PER_USD kursi bo'yicha hisoblanadi)
const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'uzs').toLowerCase();
const UZS_PER_USD = Number(process.env.UZS_PER_USD) || 12700;

function toStripeAmount(amountInUzs) {
  const amount = STRIPE_CURRENCY === 'uzs' ? amountInUzs : amountInUzs / UZS_PER_USD;
  return Math.round(amount * 100);
}

// To'lovdan keyingi xabarlar (tranzaksiyadan tashqarida, xatolari jarayonni to'xtatmaydi)
async function afterPaid(order, referral) {
  await notifyOrderPaid(order);
  if (referral) {
    await notifyUser(
      referral.inviterId,
      `🎉 <b>Do'stingiz birinchi xaridini qildi!</b>\n\nHisobingizga <b>${formatSom(referral.bonus)}</b> bonus qo'shildi. ` +
      "Uni keyingi xaridingizda ishlatishingiz mumkin 💎",
      linkButton("🛍 Xarid qilish", "/shop/home")
    );
    await notifyUser(
      referral.inviteeId,
      `💎 Taklif bonusi: hisobingizga <b>${formatSom(referral.bonus)}</b> qo'shildi! Keyingi xaridda ishlating.`
    );
  }
}

// Chekout sahifasi uchun narx tarkibi (savat, kupon, bonus, yetkazish)
const quoteOrder = async (req, res) => {
  try {
    const { couponCode, useBonus } = req.body || {};
    const quote = await calculateOrder({ userId: req.user.id, couponCode, useBonus: Boolean(useBonus) });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, message: "Hisob-kitobda xatolik" });
  }
};

const createOrder = async (req, res) => {
  const userId = req.user.id;
  try {
    const { addressInfo, couponCode, useBonus } = req.body || {};
    const quote = await calculateOrder({ userId, couponCode, useBonus: Boolean(useBonus) });

    if (!quote.lines.length) {
      return res.status(400).json({ success: false, message: "Savatingiz bo'sh" });
    }
    if (couponCode && quote.couponError) {
      return res.status(400).json({ success: false, message: quote.couponError });
    }
    if (quote.stockErrors.length) {
      const first = quote.stockErrors[0];
      return res.status(400).json({
        success: false,
        message: `"${first.title}" omborda faqat ${first.available} ta qoldi`,
      });
    }

    const cartItems = quote.lines.map((line) => ({
      productId: line.productId,
      title: line.title,
      image: line.image,
      price: line.price,
      salePrice: line.salePrice,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
    }));

    const newOrder = toRecord((await pool.query(
      `INSERT INTO orders (user_id, cart_id, cart_items, address_info, order_status, payment_method,
       payment_status, total_amount, subtotal, delivery_fee, discount_amount, bonus_used, coupon_code,
       order_date, order_update_date)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, 'pending', $5, 'pending', $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [userId, quote.cartId, JSON.stringify(cartItems), JSON.stringify(addressInfo || {}),
        quote.total > 0 ? 'stripe' : 'bonus', quote.total, quote.subtotal, quote.deliveryFee,
        quote.discount, quote.bonusUsed, quote.coupon?.code || null]
    )).rows[0]);

    // Butunlay chegirma/bonus bilan qoplangan buyurtma — Stripe'siz darhol yakunlaymiz
    if (quote.total <= 0) {
      const client = await pool.connect();
      let result;
      try {
        await client.query('BEGIN');
        const locked = toRecord((await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [newOrder.id])).rows[0]);
        result = await finalizeOrder(client, locked, 'bonus');
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      afterPaid(result.order, result.referral).catch(() => {});
      return res.status(201).json({
        success: true,
        paid: true,
        orderId: newOrder.id,
        url: `${CLIENT_URL}/shop/success?paid=1`,
      });
    }

    const lineItems = quote.lines.map((line) => ({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: line.title },
        unit_amount: toStripeAmount(line.unitPrice),
      },
      quantity: line.quantity,
    }));
    if (quote.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: { name: "Yetkazib berish" },
          unit_amount: toStripeAmount(quote.deliveryFee),
        },
        quantity: 1,
      });
    }

    // Promokod + bonus chegirmasini bir martalik Stripe kuponi sifatida beramiz
    const reduction = quote.discount + quote.bonusUsed;
    let discounts;
    if (reduction > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: toStripeAmount(reduction),
        currency: STRIPE_CURRENCY,
        duration: 'once',
        name: [quote.coupon?.code, quote.bonusUsed > 0 ? 'Bonus' : null].filter(Boolean).join(' + ') || 'Chegirma',
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(discounts ? { discounts } : {}),
      success_url: `${CLIENT_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/shop/checkout`,
      metadata: { orderId: newOrder.id },
      ...(addressInfo?.email ? { customer_email: addressInfo.email } : {}),
    });

    await pool.query('UPDATE orders SET payment_id = $1 WHERE id = $2', [session.id, newOrder.id]);

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
    // Sessiya aynan shu buyurtmaga tegishli bo'lishi shart (boshqa to'lov bilan tasdiqlab bo'lmaydi)
    if (order.paymentId !== session.id && session.metadata?.orderId !== order.id) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({ success: false, message: 'Payment does not match this order' });
    }

    const result = await finalizeOrder(client, order, session.payment_intent || session.id);
    await client.query('COMMIT');
    transactionStarted = false;

    afterPaid(result.order, result.referral).catch(() => {});
    res.status(200).json({ success: true, message: 'Order confirmed', data: result.order });
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

module.exports = { quoteOrder, createOrder, confirmPayment, getAllOrdersByUser, getOrderDetails };
