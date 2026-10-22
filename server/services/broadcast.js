// Telegram orqali ommaviy aksiya xabarlari (fon rejimida, Telegram limitlariga rioya qilgan holda)
const fs = require("fs/promises");
const path = require("path");
const { pool } = require("../db");
const { sendMessage, sendPhoto, isTelegramConfigured } = require("../telegram/api");

// Telegram: bitta botdan sekundiga ~30 xabar. Xavfsiz tomonda 20/s yuboramiz.
const DELAY_MS = 50;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OPT_OUT_HINT = "\n\n<i>Aksiya xabarlarini o'chirish: /stop</i>";

async function getAudienceCount() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM users
     WHERE verify = TRUE AND telegram_chat_id IS NOT NULL AND marketing_opt_in = TRUE`
  );
  return rows[0].count;
}

function buildMarkup(buttonText, buttonUrl) {
  if (!buttonText || !/^https?:\/\//.test(buttonUrl || "")) return {};
  return { reply_markup: { inline_keyboard: [[{ text: buttonText, url: buttonUrl }]] } };
}

async function runBroadcast(broadcastId, { message, imagePath, buttonText, buttonUrl }) {
  const { rows: recipients } = await pool.query(
    `SELECT id, telegram_chat_id FROM users
     WHERE verify = TRUE AND telegram_chat_id IS NOT NULL AND marketing_opt_in = TRUE`
  );
  await pool.query("UPDATE broadcasts SET total_count = $1 WHERE id = $2", [recipients.length, broadcastId]);

  const text = `${message}${OPT_OUT_HINT}`;
  const extra = buildMarkup(buttonText, buttonUrl);

  // Rasm bir marta yuklanadi, so'ng Telegram file_id qayta ishlatiladi
  let photo = null;
  if (imagePath) {
    const buffer = await fs.readFile(path.join(process.cwd(), imagePath.replace(/^\//, "")));
    photo = { buffer, filename: path.basename(imagePath) };
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += 1) {
    const { telegram_chat_id: chatId, id: userId } = recipients[i];
    let attempts = 0;
    while (attempts < 3) {
      attempts += 1;
      try {
        if (photo) {
          const result = await sendPhoto(chatId, photo, text, extra);
          // Keyingi qabul qiluvchilar uchun eng katta o'lchamdagi rasm file_id'si
          if (typeof photo !== "string" && result?.photo?.length) {
            photo = result.photo[result.photo.length - 1].file_id;
          }
        } else {
          await sendMessage(chatId, text, extra);
        }
        sent += 1;
        break;
      } catch (error) {
        if (error.code === 429 && error.retryAfter) {
          await sleep(error.retryAfter * 1000);
          continue;
        }
        // 403 — foydalanuvchi botni bloklagan: endi xabar yubormaymiz
        if (error.code === 403) {
          await pool.query("UPDATE users SET marketing_opt_in = FALSE WHERE id = $1", [userId]).catch(() => {});
        }
        failed += 1;
        break;
      }
    }

    if ((i + 1) % 25 === 0) {
      await pool.query(
        "UPDATE broadcasts SET sent_count = $1, failed_count = $2 WHERE id = $3",
        [sent, failed, broadcastId]
      );
    }
    await sleep(DELAY_MS);
  }

  await pool.query(
    `UPDATE broadcasts SET sent_count = $1, failed_count = $2, status = 'done', finished_at = NOW()
     WHERE id = $3`,
    [sent, failed, broadcastId]
  );
}

// Broadcast'ni yaratib, fon rejimida yuborishni boshlaydi
async function startBroadcast({ message, imagePath, buttonText, buttonUrl, createdBy }) {
  if (!isTelegramConfigured()) throw new Error("Telegram bot sozlanmagan (TELEGRAM_BOT_TOKEN)");

  const broadcast = (await pool.query(
    `INSERT INTO broadcasts (message, image, button_text, button_url, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [message, imagePath || null, buttonText || null, buttonUrl || null, createdBy || null]
  )).rows[0];

  runBroadcast(broadcast.id, { message, imagePath, buttonText, buttonUrl }).catch(async (error) => {
    console.error("[broadcast] Xato:", error.message);
    await pool.query(
      "UPDATE broadcasts SET status = 'done', finished_at = NOW() WHERE id = $1",
      [broadcast.id]
    ).catch(() => {});
  });

  return broadcast;
}

module.exports = { startBroadcast, getAudienceCount };
