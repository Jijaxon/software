// To'lov tasdiqlangan buyurtmani yakunlash — barcha o'zgarishlar bitta tranzaksiyada.
const { toRecord } = require("../db/records");
const { rewardReferral } = require("./referral");

// client — BEGIN qilingan pg client; order — toRecord qilingan, FOR UPDATE bilan qulflangan buyurtma
async function finalizeOrder(client, order, paymentRef) {
  // 1. Ombordan ayiramiz va sotilganlar sonini oshiramiz
  for (const item of order.cartItems || []) {
    const stockUpdate = await client.query(
      `UPDATE products SET total_stock = total_stock - $1, sold_count = sold_count + $1, updated_at = NOW()
       WHERE id = $2 AND total_stock >= $1`,
      [item.quantity, item.productId]
    );
    if (!stockUpdate.rowCount) throw new Error(`Insufficient stock for product ${item.productId}`);
  }

  // 2. Buyurtma holati
  await client.query(
    `UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', payment_id = $1,
     order_update_date = NOW(), updated_at = NOW() WHERE id = $2`,
    [paymentRef, order.id]
  );

  // 3. Promokoddan foydalanishni qayd etamiz
  if (order.couponCode) {
    const coupon = (await client.query("SELECT id FROM coupons WHERE code = $1", [order.couponCode])).rows[0];
    if (coupon) {
      const inserted = await client.query(
        `INSERT INTO coupon_redemptions (coupon_id, user_id, order_id, discount_amount)
         VALUES ($1, $2, $3, $4) ON CONFLICT (coupon_id, order_id) DO NOTHING`,
        [coupon.id, order.userId, order.id, order.discountAmount || 0]
      );
      if (inserted.rowCount) {
        await client.query("UPDATE coupons SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1", [coupon.id]);
      }
    }
  }

  // 4. Ishlatilgan bonusni balansdan yechamiz (to'lov allaqachon o'tgan — manfiyga tushirmaymiz)
  if (order.bonusUsed > 0 && order.userId) {
    await client.query(
      "UPDATE users SET bonus_balance = GREATEST(0, bonus_balance - $1) WHERE id = $2",
      [order.bonusUsed, order.userId]
    );
    await client.query(
      "INSERT INTO bonus_transactions (user_id, amount, reason, order_id) VALUES ($1, $2, 'order_spend', $3)",
      [order.userId, -order.bonusUsed, order.id]
    );
  }

  // 5. Savatni tozalaymiz
  if (order.cartId) await client.query("DELETE FROM carts WHERE id = $1", [order.cartId]);

  // 6. Referal mukofoti (birinchi to'langan buyurtma)
  const referral = order.userId ? await rewardReferral(client, order.userId, order.id) : null;

  const updated = toRecord((await client.query("SELECT * FROM orders WHERE id = $1", [order.id])).rows[0]);
  return { order: updated, referral };
}

module.exports = { finalizeOrder };
