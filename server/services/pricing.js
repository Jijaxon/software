// Buyurtma narxini SERVERDA hisoblash: savat bazadan olinadi, narxlar mahsulot jadvalidan.
// Klient yuborgan narx/summa hech qachon ishlatilmaydi.
const { pool } = require("../db");
const { getSettings } = require("./settings");

const roundSom = (value) => Math.round(Number(value) || 0);

// 125000 -> "125 000 so'm"
function formatSom(value) {
  return `${roundSom(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

async function loadCartLines(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT c.id AS cart_id, ci.product_id, ci.quantity, p.title, p.image, p.price, p.sale_price, p.total_stock
     FROM carts c
     JOIN cart_items ci ON ci.cart_id = c.id
     JOIN products p ON p.id = ci.product_id
     WHERE c.user_id = $1 ORDER BY ci.id`,
    [userId]
  );

  const lines = rows.map((row) => {
    const price = Number(row.price) || 0;
    const salePrice = Number(row.sale_price) || 0;
    const unitPrice = roundSom(price * (1 - salePrice / 100));
    return {
      productId: row.product_id,
      title: row.title,
      image: row.image,
      price,
      salePrice,
      unitPrice,
      quantity: row.quantity,
      totalStock: row.total_stock,
      lineTotal: unitPrice * row.quantity,
    };
  });

  return { cartId: rows[0]?.cart_id || null, lines };
}

// Promokodni tekshiradi. Natija: { coupon, discount, error }
async function validateCoupon(code, { userId, subtotal }, db = pool) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { coupon: null, discount: 0, error: null };

  const coupon = (await db.query("SELECT * FROM coupons WHERE code = $1", [normalized])).rows[0];
  const fail = (error) => ({ coupon: null, discount: 0, error });

  if (!coupon) return fail("Promokod topilmadi");
  if (!coupon.is_active) return fail("Promokod faol emas");
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return fail("Promokod hali boshlanmagan");
  if (coupon.expires_at && new Date(coupon.expires_at) <= now) return fail("Promokod muddati tugagan");
  if (coupon.user_id && coupon.user_id !== userId) return fail("Bu promokod sizga tegishli emas");
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return fail("Promokod limiti tugagan");

  if (coupon.per_user_limit > 0 && userId) {
    const used = Number((await db.query(
      "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = $1 AND user_id = $2",
      [coupon.id, userId]
    )).rows[0].count);
    if (used >= coupon.per_user_limit) return fail("Siz bu promokoddan foydalanib bo'lgansiz");
  }

  const minOrder = Number(coupon.min_order) || 0;
  if (subtotal < minOrder) return fail(`Promokod ${formatSom(minOrder)}dan ortiq xaridga amal qiladi`);

  const value = Number(coupon.discount_value) || 0;
  const discount = coupon.discount_type === "percent"
    ? roundSom((subtotal * Math.min(value, 100)) / 100)
    : Math.min(roundSom(value), subtotal);

  return { coupon, discount, error: null };
}

// To'liq hisob-kitob (quote va buyurtma yaratishda bir xil ishlatiladi)
async function calculateOrder({ userId, couponCode, useBonus }, db = pool) {
  const settings = await getSettings();
  const { cartId, lines } = await loadCartLines(userId, db);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  const deliveryFeeSetting = roundSom(settings.delivery_fee);
  const threshold = roundSom(settings.free_delivery_threshold);
  const freeDelivery = threshold > 0 && subtotal >= threshold;
  const deliveryFee = lines.length && !freeDelivery ? deliveryFeeSetting : 0;

  const { coupon, discount, error: couponError } = await validateCoupon(couponCode, { userId, subtotal }, db);

  const user = (await db.query("SELECT bonus_balance FROM users WHERE id = $1", [userId])).rows[0];
  const bonusAvailable = roundSom(user?.bonus_balance);

  const payable = Math.max(0, subtotal - discount + deliveryFee);
  const bonusUsed = useBonus ? Math.min(bonusAvailable, payable) : 0;
  const total = Math.max(0, payable - bonusUsed);

  const stockErrors = lines
    .filter((line) => line.quantity > (line.totalStock ?? 0))
    .map((line) => ({ productId: line.productId, title: line.title, available: line.totalStock ?? 0 }));

  return {
    cartId,
    lines,
    subtotal,
    deliveryFee,
    deliveryFeeSetting,
    freeDeliveryThreshold: threshold,
    amountToFreeDelivery: threshold > 0 ? Math.max(0, threshold - subtotal) : 0,
    coupon: coupon
      ? { code: coupon.code, discountType: coupon.discount_type, discountValue: Number(coupon.discount_value) }
      : null,
    couponError,
    discount,
    bonusAvailable,
    bonusUsed,
    total,
    stockErrors,
  };
}

module.exports = { calculateOrder, validateCoupon, loadCartLines, formatSom, roundSom };
