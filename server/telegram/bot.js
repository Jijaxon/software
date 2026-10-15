// NAFIS Telegram boti: ro'yxatdan o'tishni tasdiqlash va kirish kodlarini yuboradi.
// Long polling ishlatiladi — server uchun ochiq URL (webhook) kerak emas.
const { pool } = require('../db');
const { toRecord } = require('../db/records');
const { callTelegram, sendMessage, getBotInfo, isTelegramConfigured } = require('./api');
const { normalizePhone, formatPhone, getCooldownSeconds, issueCode, CODE_TTL_MINUTES } = require('./codes');

const POLL_TIMEOUT_SECONDS = 30;

const contactKeyboard = {
  keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

const texts = {
  welcome:
    "✨ <b>NAFIS</b> go'zallik do'koni botiga xush kelibsiz!\n\n" +
    "Bu bot orqali siz:\n" +
    "• saytda ro'yxatdan o'tishni tasdiqlaysiz\n" +
    "• parolsiz, kod orqali saytga kirasiz\n\n" +
    "Ro'yxatdan o'tish uchun saytdagi <b>«Ro'yxatdan o'tish»</b> sahifasidan boshlang — u yerdagi tugma sizni shu botga olib keladi.",
  linkExpired:
    "⏳ Havola eskirgan yoki noto'g'ri.\n\nIltimos, saytga qaytib ro'yxatdan o'tishni qaytadan boshlang yoki hisobingizga kiring.",
  alreadyVerified: (username) =>
    `✅ Bu Telegram akkaunt <b>${escapeHtml(username)}</b> hisobiga ulangan.\n\n` +
    "Saytga kirish uchun «Telegram orqali kirish»ni tanlang — kod shu yerga keladi.",
  chatTaken:
    "⚠️ Bu Telegram akkaunt boshqa NAFIS hisobiga ulangan. Saytga o'sha hisob bilan kiring.",
  askContact: (username) =>
    `Salom, <b>${escapeHtml(username)}</b>! 👋\n\n` +
    "Ro'yxatdan o'tishni yakunlash uchun pastdagi tugma orqali telefon raqamingizni yuboring.",
  foreignContact: "❗️ Iltimos, pastdagi tugma orqali <b>o'zingizning</b> raqamingizni yuboring.",
  noPending:
    "Avval saytda ro'yxatdan o'ting — u yerdagi «Telegram'da tasdiqlash» tugmasi sizni shu botga olib keladi.",
  phoneTaken: (phone) =>
    `⚠️ ${formatPhone(phone)} raqami bilan hisob allaqachon mavjud.\n\nSaytda shu raqam orqali kiring.`,
  codeSent: (phone) =>
    `📱 Raqam qabul qilindi: <b>${formatPhone(phone)}</b>\n\nTasdiqlash kodi quyida 👇`,
  cooldown: (seconds) => `⏳ Yangi kodni ${seconds} soniyadan so'ng olishingiz mumkin.`,
  help:
    "ℹ️ <b>Yordam</b>\n\n" +
    "/start — botni ishga tushirish\n" +
    "/kod — yangi tasdiqlash kodini olish\n" +
    "/help — yordam\n\n" +
    `Kodlar ${CODE_TTL_MINUTES} daqiqa amal qiladi. Kodni hech kimga bermang — NAFIS xodimlari uni hech qachon so'ramaydi.`,
};

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function findUser(query, params) {
  return toRecord((await pool.query(query, params)).rows[0]);
}

function findVerifiedByChat(chatId) {
  return findUser('SELECT * FROM users WHERE telegram_chat_id = $1 AND verify = TRUE LIMIT 1', [chatId]);
}

function findPendingByChat(chatId) {
  return findUser(
    'SELECT * FROM users WHERE telegram_chat_id = $1 AND verify = FALSE ORDER BY updated_at DESC LIMIT 1',
    [chatId]
  );
}

// /start <token> — saytdagi havola orqali kelgan foydalanuvchi
async function handleStart(message, payload) {
  const chatId = message.chat.id;

  if (!payload) {
    const linked = await findVerifiedByChat(chatId);
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked.username) : texts.welcome);
    return;
  }

  const user = await findUser(
    `SELECT * FROM users WHERE telegram_link_token = $1 AND verify = FALSE
     AND updated_at > NOW() - INTERVAL '1 day'`,
    [payload]
  );
  if (!user) {
    await sendMessage(chatId, texts.linkExpired);
    return;
  }

  const linked = await findVerifiedByChat(chatId);
  if (linked) {
    await sendMessage(chatId, texts.chatTaken);
    return;
  }

  // Shu chatga avval bog'langan, tasdiqlanmay qolgan hisoblarni ajratamiz
  await pool.query(
    'UPDATE users SET telegram_chat_id = NULL WHERE telegram_chat_id = $1 AND verify = FALSE AND id <> $2',
    [chatId, user.id]
  );
  await pool.query(
    'UPDATE users SET telegram_chat_id = $1, telegram_username = $2, updated_at = NOW() WHERE id = $3',
    [chatId, message.from?.username || null, user.id]
  );

  await sendMessage(chatId, texts.askContact(user.username), { reply_markup: contactKeyboard });
}

// Foydalanuvchi telefon raqamini yuborganda
async function handleContact(message) {
  const chatId = message.chat.id;
  const contact = message.contact;

  if (!contact || contact.user_id !== message.from?.id) {
    await sendMessage(chatId, texts.foreignContact, { reply_markup: contactKeyboard });
    return;
  }

  const user = await findPendingByChat(chatId);
  if (!user) {
    const linked = await findVerifiedByChat(chatId);
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked.username) : texts.noPending, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  const phone = normalizePhone(contact.phone_number);
  const owner = await findUser(
    'SELECT id FROM users WHERE phone = $1 AND verify = TRUE AND id <> $2 LIMIT 1',
    [phone, user.id]
  );
  if (owner) {
    await sendMessage(chatId, texts.phoneTaken(phone), { reply_markup: { remove_keyboard: true } });
    return;
  }

  await pool.query('UPDATE users SET phone = $1, updated_at = NOW() WHERE id = $2', [phone, user.id]);
  await sendMessage(chatId, texts.codeSent(phone), { reply_markup: { remove_keyboard: true } });
  await issueCode({ ...user, phone, telegramChatId: chatId }, 'verify');
}

// /kod — tasdiqlanmagan foydalanuvchiga yangi kod
async function handleResendCommand(message) {
  const chatId = message.chat.id;
  const user = await findPendingByChat(chatId);

  if (!user) {
    const linked = await findVerifiedByChat(chatId);
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked.username) : texts.noPending);
    return;
  }
  if (!user.phone) {
    await sendMessage(chatId, texts.askContact(user.username), { reply_markup: contactKeyboard });
    return;
  }

  const wait = getCooldownSeconds(user);
  if (wait > 0) {
    await sendMessage(chatId, texts.cooldown(wait));
    return;
  }
  await issueCode(user, 'verify');
}

async function handleMessage(message) {
  if (!message || message.chat?.type !== 'private') return;

  if (message.contact) {
    await handleContact(message);
    return;
  }

  const text = (message.text || '').trim();
  const [command, ...rest] = text.split(/\s+/);
  const commandName = command.split('@')[0].toLowerCase();

  switch (commandName) {
    case '/start':
      await handleStart(message, rest.join(' ').trim());
      break;
    case '/kod':
    case '/code':
      await handleResendCommand(message);
      break;
    case '/help':
    case '/yordam':
      await sendMessage(message.chat.id, texts.help);
      break;
    default: {
      const pending = await findPendingByChat(message.chat.id);
      if (pending && !pending.phone) {
        await sendMessage(message.chat.id, texts.askContact(pending.username), { reply_markup: contactKeyboard });
      } else {
        await sendMessage(message.chat.id, texts.help);
      }
    }
  }
}

let isRunning = false;

async function pollUpdates() {
  let offset = 0;

  while (isRunning) {
    try {
      const updates = await callTelegram('getUpdates', {
        offset,
        timeout: POLL_TIMEOUT_SECONDS,
        allowed_updates: ['message'],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        try {
          await handleMessage(update.message);
        } catch (error) {
          console.error('[telegram] Xabarni qayta ishlashda xato:', error.message);
          if (update.message?.chat?.id) {
            await sendMessage(update.message.chat.id, "😔 Xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.").catch(() => {});
          }
        }
      }
    } catch (error) {
      // 409 — boshqa nusxa ham polling qilmoqda (masalan, nodemon qayta ishga tushganda)
      const delay = error.retryAfter ? error.retryAfter * 1000 : 5000;
      if (error.code !== 409) console.error('[telegram] getUpdates xatosi:', error.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function startTelegramBot() {
  if (!isTelegramConfigured()) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN topilmadi — bot ishga tushmadi. Kodlar konsolga chiqariladi.');
    return;
  }

  try {
    const info = await getBotInfo();
    // Webhook o'rnatilgan bo'lsa, getUpdates ishlamaydi
    await callTelegram('deleteWebhook', { drop_pending_updates: false });
    await callTelegram('setMyCommands', {
      commands: [
        { command: 'start', description: 'Botni ishga tushirish' },
        { command: 'kod', description: 'Yangi tasdiqlash kodini olish' },
        { command: 'help', description: 'Yordam' },
      ],
    });
    isRunning = true;
    pollUpdates();
    console.log(`[telegram] @${info.username} boti ishga tushdi`);
  } catch (error) {
    console.error('[telegram] Botni ishga tushirib bo\'lmadi:', error.message);
  }
}

function stopTelegramBot() {
  isRunning = false;
}

module.exports = { startTelegramBot, stopTelegramBot };
