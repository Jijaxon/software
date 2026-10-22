const crypto = require("crypto");
const { pool } = require("../db");
const { getSettings } = require("./settings");

// Adashtiradigan belgilarsiz (0/O, 1/I) 6 belgili kod
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i += 1) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return code;
}

// Foydalanuvchining referal kodini qaytaradi; bo'lmasa yaratadi
async function ensureReferralCode(userId, db = pool) {
  const existing = (await db.query("SELECT referral_code FROM users WHERE id = $1", [userId])).rows[0];
  if (existing?.referral_code) return existing.referral_code;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomCode();
    try {
      const { rows } = await db.query(
        "UPDATE users SET referral_code = $1 WHERE id = $2 AND referral_code IS NULL RETURNING referral_code",
        [code, userId]
      );
      if (rows[0]) return rows[0].referral_code;
      // boshqa so'rov allaqachon yozib qo'ygan bo'lishi mumkin
      const again = (await db.query("SELECT referral_code FROM users WHERE id = $1", [userId])).rows[0];
      if (again?.referral_code) return again.referral_code;
    } catch (error) {
      if (error.code !== "23505") throw error; // unikal to'qnashuv — boshqa kod bilan qayta urinamiz
    }
  }
  throw new Error("Referal kod yaratib bo'lmadi");
}

async function findUserIdByReferralCode(code, db = pool) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;
  const row = (await db.query("SELECT id FROM users WHERE referral_code = $1", [normalized])).rows[0];
  return row?.id || null;
}

// Birinchi to'langan buyurtmadan so'ng taklif qilgan va taklif qilingan foydalanuvchiga bonus.
// Tranzaksiya ichida (client) chaqiriladi. Natija: { inviterId, inviteeId, bonus } yoki null
async function rewardReferral(client, userId, orderId) {
  const user = (await client.query(
    "SELECT referred_by, referral_rewarded FROM users WHERE id = $1 FOR UPDATE",
    [userId]
  )).rows[0];
  if (!user?.referred_by || user.referral_rewarded) return null;

  const bonus = Math.round(Number((await getSettings()).referral_bonus) || 0);
  await client.query("UPDATE users SET referral_rewarded = TRUE WHERE id = $1", [userId]);
  if (bonus <= 0) return null;

  for (const [id, reason] of [[user.referred_by, "referral_inviter"], [userId, "referral_invitee"]]) {
    await client.query("UPDATE users SET bonus_balance = bonus_balance + $1 WHERE id = $2", [bonus, id]);
    await client.query(
      "INSERT INTO bonus_transactions (user_id, amount, reason, order_id) VALUES ($1, $2, $3, $4)",
      [id, bonus, reason, orderId]
    );
  }
  return { inviterId: user.referred_by, inviteeId: userId, bonus };
}

module.exports = { ensureReferralCode, findUserIdByReferralCode, rewardReferral, randomCode };
