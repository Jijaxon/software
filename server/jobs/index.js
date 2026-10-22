// Davriy fon vazifalari (bitta server nusxasi uchun mo'ljallangan)
const { pool } = require("../db");
const { getSettings } = require("../services/settings");
const { randomCode } = require("../services/referral");
const { sendMessage, isTelegramConfigured } = require("../telegram/api");
const { linkButton, escapeHtml } = require("../telegram/notify");

// Chegirma muddati tugagan mahsulotlarni oddiy narxga qaytaradi
async function expireSales() {
  const { rowCount } = await pool.query(
    `UPDATE products SET sale_price = 0, sale_ends_at = NULL, updated_at = NOW()
     WHERE sale_ends_at IS NOT NULL AND sale_ends_at <= NOW()`
  );
  if (rowCount) console.log(`[jobs] ${rowCount} ta mahsulot chegirmasi tugadi`);
}

// Savatini tashlab ketgan foydalanuvchilarga Telegram'da eslatma + shaxsiy promokod
async function remindAbandonedCarts() {
  if (!isTelegramConfigured()) return;
  const settings = await getSettings();
  if (!settings.abandoned_cart_enabled) return;

  const hours = Math.max(1, Number(settings.abandoned_cart_hours) || 3);
  const discount = Math.min(50, Math.max(0, Number(settings.abandoned_cart_discount) || 0));

  const { rows } = await pool.query(
    `SELECT c.id AS cart_id, c.user_id, u.telegram_chat_id,
            SUM(ci.quantity)::int AS quantity,
            (ARRAY_AGG(p.title ORDER BY ci.id))[1:3] AS titles
     FROM carts c
     JOIN users u ON u.id = c.user_id
     JOIN cart_items ci ON ci.cart_id = c.id
     JOIN products p ON p.id = ci.product_id
     WHERE u.verify = TRUE AND u.telegram_chat_id IS NOT NULL AND u.marketing_opt_in = TRUE
       AND c.updated_at < NOW() - make_interval(hours => $1)
       AND c.updated_at > NOW() - INTERVAL '7 days'
       AND (c.reminder_sent_at IS NULL OR c.reminder_sent_at < c.updated_at)
     GROUP BY c.id, c.user_id, u.telegram_chat_id
     LIMIT 50`,
    [hours]
  );

  for (const row of rows) {
    try {
      let couponLine = "";
      if (discount > 0) {
        const code = `SAVAT${randomCode(5)}`;
        await pool.query(
          `INSERT INTO coupons (code, description, discount_type, discount_value, max_uses, per_user_limit,
           user_id, expires_at, source)
           VALUES ($1, $2, 'percent', $3, 1, 1, $4, NOW() + INTERVAL '24 hours', 'abandoned_cart')`,
          [code, "Tashlab ketilgan savat uchun shaxsiy chegirma", discount, row.user_id]
        );
        couponLine =
          `\n\n🎁 Faqat siz uchun <b>${discount}% chegirma</b> — promokod: <code>${code}</code>\n` +
          "⏳ 24 soat amal qiladi.";
      }

      const titles = (row.titles || []).map((t) => `• ${escapeHtml(t)}`).join("\n");
      await sendMessage(
        row.telegram_chat_id,
        `🛍 <b>Savatingizda ${row.quantity} ta mahsulot kutmoqda!</b>\n\n${titles}${couponLine}`,
        linkButton("🛒 Xaridni yakunlash", "/shop/checkout")
      );
    } catch (error) {
      console.error("[jobs] Savat eslatmasi yuborilmadi:", error.message);
    }
    // Xato bo'lsa ham qayta-qayta urinmaslik uchun belgilaymiz (updated_at o'zgarmaydi)
    await pool.query("UPDATE carts SET reminder_sent_at = NOW() WHERE id = $1", [row.cart_id]);
  }
}

function schedule(name, fn, intervalMs) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await fn();
    } catch (error) {
      console.error(`[jobs] ${name} xatosi:`, error.message);
    } finally {
      running = false;
    }
  };
  setTimeout(tick, 5000);
  return setInterval(tick, intervalMs);
}

function startJobs() {
  schedule("expireSales", expireSales, 60 * 1000);
  schedule("abandonedCarts", remindAbandonedCarts, 10 * 60 * 1000);
  console.log("[jobs] Fon vazifalari ishga tushdi");
}

module.exports = { startJobs, expireSales, remindAbandonedCarts };
