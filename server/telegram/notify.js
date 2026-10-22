// Foydalanuvchi va adminlarga Telegram orqali xabar yuborish (buyurtma holati, bonus va h.k.)
// Xatolar hech qachon asosiy jarayonni (to'lov, holat yangilash) to'xtatmasligi kerak.
const { pool } = require("../db");
const { sendMessage, isTelegramConfigured } = require("./api");
const { formatSom } = require("../services/pricing");

const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const shortId = (id) => String(id || "").slice(0, 8).toUpperCase();

// Telegram inline tugmalarida faqat ochiq (https) manzil qabul qilinadi; localhost'da tugma qo'shmaymiz
function linkButton(text, path) {
  const url = `${CLIENT_URL}${path}`;
  if (!/^https:\/\//.test(url)) return {};
  return { reply_markup: { inline_keyboard: [[{ text, url }]] } };
}

async function getChatId(userId) {
  if (!userId) return null;
  const row = (await pool.query(
    "SELECT telegram_chat_id FROM users WHERE id = $1 AND verify = TRUE AND telegram_chat_id IS NOT NULL",
    [userId]
  )).rows[0];
  return row?.telegram_chat_id || null;
}

async function notifyUser(userId, text, extra = {}) {
  if (!isTelegramConfigured()) return false;
  try {
    const chatId = await getChatId(userId);
    if (!chatId) return false;
    await sendMessage(chatId, text, extra);
    return true;
  } catch (error) {
    console.error("[telegram] Foydalanuvchiga xabar yuborilmadi:", error.message);
    return false;
  }
}

async function notifyAdmins(text, extra = {}) {
  if (!isTelegramConfigured()) return;
  try {
    const { rows } = await pool.query(
      "SELECT telegram_chat_id FROM users WHERE role = 'admin' AND telegram_chat_id IS NOT NULL"
    );
    for (const row of rows) {
      await sendMessage(row.telegram_chat_id, text, extra).catch((e) =>
        console.error("[telegram] Adminga xabar yuborilmadi:", e.message)
      );
    }
  } catch (error) {
    console.error("[telegram] Adminlarni olishda xato:", error.message);
  }
}

const statusTexts = {
  confirmed: (id) => `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\nBuyurtma <b>#${id}</b> qabul qilindi. Tez orada tayyorlashni boshlaymiz.`,
  inProcess: (id) => `🧴 <b>Buyurtmangiz tayyorlanmoqda</b>\n\nBuyurtma <b>#${id}</b> qadoqlanmoqda — mehr bilan!`,
  inShipping: (id) => `🚗 <b>Buyurtmangiz yo'lda!</b>\n\nBuyurtma <b>#${id}</b> kuryerga topshirildi. Tez orada yetib boradi.`,
  delivered: (id) => `🎉 <b>Buyurtmangiz yetkazildi!</b>\n\nBuyurtma <b>#${id}</b> uchun rahmat. Mahsulotga fikr qoldirsangiz, boshqalarga yordam berasiz 💛`,
  rejected: (id) => `😔 <b>Buyurtma bekor qilindi</b>\n\nBuyurtma <b>#${id}</b> bekor qilindi. Savollar bo'lsa, bizga yozing.`,
};

async function notifyOrderStatus(order, status) {
  const build = statusTexts[status];
  if (!build || !order?.userId) return false;
  return notifyUser(order.userId, build(shortId(order.id)), linkButton("📦 Buyurtmalarim", "/shop/account"));
}

// To'lov tasdiqlanganda: mijozga chek, adminlarga yangi buyurtma haqida
async function notifyOrderPaid(order) {
  const items = (order.cartItems || [])
    .map((item) => `• ${escapeHtml(item.title)} × ${item.quantity}`)
    .join("\n");

  const lines = [
    `✅ <b>Buyurtma #${shortId(order.id)} qabul qilindi!</b>`,
    "",
    items,
    "",
    order.discountAmount > 0 ? `🎁 Chegirma: −${formatSom(order.discountAmount)}` : null,
    order.bonusUsed > 0 ? `💎 Bonus: −${formatSom(order.bonusUsed)}` : null,
    `🚚 Yetkazish: ${order.deliveryFee > 0 ? formatSom(order.deliveryFee) : "bepul"}`,
    `💳 Jami: <b>${formatSom(order.totalAmount)}</b>`,
    "",
    "Holat o'zgarishi haqida shu yerda xabar beramiz.",
  ].filter((line) => line !== null);

  await notifyUser(order.userId, lines.join("\n"), linkButton("📦 Buyurtmalarim", "/shop/account"));

  const address = order.addressInfo || {};
  await notifyAdmins(
    `🛍 <b>Yangi buyurtma #${shortId(order.id)}</b>\n\n${items}\n\n` +
    `💳 ${formatSom(order.totalAmount)}\n` +
    `📍 ${escapeHtml([address.city, address.district, address.address].filter(Boolean).join(", "))}\n` +
    `📞 ${escapeHtml(address.phone || "—")}`
  );
}

module.exports = {
  notifyUser,
  notifyAdmins,
  notifyOrderStatus,
  notifyOrderPaid,
  linkButton,
  escapeHtml,
  shortId,
  CLIENT_URL,
};
