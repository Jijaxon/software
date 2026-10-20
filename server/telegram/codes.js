// Bir martalik kodlar (OTP) va telefon raqamlar bilan ishlash
const crypto = require('crypto');
const { pool } = require('../db');
const { sendMessage, isTelegramConfigured } = require('./api');

const CODE_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_CODE_ATTEMPTS = 5;

function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function generateLinkToken() {
  return crypto.randomBytes(16).toString('hex');
}

// "+998 90 123-45-67", "901234567", "998901234567" -> "998901234567"
function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 9) return `998${digits}`;
  return digits;
}

function isValidUzPhone(phone) {
  return /^998\d{9}$/.test(phone || '');
}

// 998901234567 -> +998 90 123 45 67
function formatPhone(phone) {
  const match = /^998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone || '');
  if (!match) return phone ? `+${phone}` : '';
  return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

// Qayta yuborish uchun necha soniya kutish kerakligi (0 bo'lsa yuborish mumkin)
function getCooldownSeconds(user) {
  if (!user?.codeSentAt) return 0;
  const passed = (Date.now() - new Date(user.codeSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - passed));
}

const codeMessages = {
  verify: (code) =>
    `🔐 <b>NAFIS</b> — ro'yxatdan o'tishni tasdiqlash kodi:\n\n<code>${code}</code>\n\n` +
    `Kodni saytdagi maydonga kiriting. Kod ${CODE_TTL_MINUTES} daqiqa amal qiladi.\n` +
    `⚠️ Kodni hech kimga bermang.`,
  login: (code) =>
    `🔑 <b>NAFIS</b> — saytga kirish kodi:\n\n<code>${code}</code>\n\n` +
    `Kod ${CODE_TTL_MINUTES} daqiqa amal qiladi.\n` +
    `⚠️ Agar siz kirmoqchi bo'lmasangiz, bu xabarga e'tibor bermang.`,
  reset: (code) =>
    `🔄 <b>NAFIS</b> — parolni tiklash kodi:\n\n<code>${code}</code>\n\n` +
    `Kodni saytdagi parolni tiklash sahifasiga kiriting. Kod ${CODE_TTL_MINUTES} daqiqa amal qiladi.\n` +
    `⚠️ Agar siz so'ramagan bo'lsangiz, bu xabarga e'tibor bermang.`,
};

// Yangi kod yaratib, bazaga (xeshlangan holda) yozadi va Telegram orqali yuboradi
async function issueCode(user, purpose = 'verify') {
  const code = generateCode();

  await pool.query(
    `UPDATE users SET verification_code = $1, code_expires_at = NOW() + ($2 || ' minutes')::interval,
     code_sent_at = NOW(), code_attempts = 0, code_purpose = $3, updated_at = NOW() WHERE id = $4`,
    [hashCode(code), String(CODE_TTL_MINUTES), purpose, user.id]
  );

  if (!isTelegramConfigured() || !user.telegramChatId) {
    // Bot sozlanmagan bo'lsa, ishlab chiqish jarayonida kod konsolga chiqariladi
    console.warn(`[telegram] Bot sozlanmagan. ${user.username} uchun kod: ${code}`);
    return;
  }

  await sendMessage(user.telegramChatId, codeMessages[purpose](code), {
    reply_markup: { remove_keyboard: true },
  });
}

// Kodni tekshiradi. Natija: { ok: true } yoki { ok: false, message }
async function checkCode(user, code) {
  if (!user.verificationCode || !user.codeExpiresAt) {
    return { ok: false, message: "Avval tasdiqlash kodini oling" };
  }
  if (new Date(user.codeExpiresAt).getTime() < Date.now()) {
    return { ok: false, message: "Kodning amal qilish muddati tugagan. Yangi kod oling" };
  }
  if (user.codeAttempts >= MAX_CODE_ATTEMPTS) {
    return { ok: false, message: "Urinishlar soni tugadi. Yangi kod oling" };
  }

  const expected = Buffer.from(user.verificationCode);
  const received = Buffer.from(hashCode(String(code || '').trim()));
  const isMatch = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!isMatch) {
    await pool.query('UPDATE users SET code_attempts = code_attempts + 1 WHERE id = $1', [user.id]);
    const left = MAX_CODE_ATTEMPTS - user.codeAttempts - 1;
    return { ok: false, message: left > 0 ? `Kod noto'g'ri. Yana ${left} ta urinish qoldi` : "Kod noto'g'ri. Yangi kod oling" };
  }

  return { ok: true };
}

async function clearCode(userId) {
  await pool.query(
    `UPDATE users SET verification_code = '', code_expires_at = NULL, code_attempts = 0 WHERE id = $1`,
    [userId]
  );
}

module.exports = {
  generateLinkToken,
  normalizePhone,
  isValidUzPhone,
  formatPhone,
  getCooldownSeconds,
  issueCode,
  checkCode,
  clearCode,
  CODE_TTL_MINUTES,
};
