// NAFIS Telegram boti: ro'yxatdan o'tishni tasdiqlash va kirish kodlarini yuboradi.
// Long polling ishlatiladi — server uchun ochiq URL (webhook) kerak emas.
const { pool } = require('../db');
const { toRecord } = require('../db/records');
const { callTelegram, sendMessage, getBotInfo, isTelegramConfigured } = require('./api');
const { normalizePhone, formatPhone, getCooldownSeconds, issueCode, CODE_TTL_MINUTES } = require('./codes');

const POLL_TIMEOUT_SECONDS = 30;
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

// setMyCommands va /help shu ro'yxatdan quriladi
const botCommands = [
  { command: 'start', description: 'Botni ishga tushirish' },
  { command: 'kod', description: 'Yangi tasdiqlash kodini olish' },
  { command: 'kirish', description: 'Saytga Telegram orqali kirish' },
  { command: 'forgot', description: 'Parolni tiklash kodini olish' },
  { command: 'profil', description: 'Ulangan hisob ma\'lumotlari' },
  { command: 'sayt', description: 'Sayt havolalari' },
  { command: 'obuna', description: 'Aksiya xabarlarini yoqish' },
  { command: 'stop', description: 'Aksiya xabarlarini o\'chirish' },
  { command: 'help', description: 'Yordam' },
];

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
  alreadyVerified: (user) =>
    `✅ Bu Telegram akkaunt <b>${escapeHtml(accountName(user))}</b> hisobiga ulangan.\n\n` +
    "Saytga kirish uchun «Telegram orqali kirish»ni tanlang — kod shu yerga keladi.",
  chatTaken:
    "⚠️ Bu Telegram akkaunt boshqa NAFIS hisobiga ulangan. Saytga o'sha hisob bilan kiring.",
  askContact: (user) =>
    `Salom, <b>${escapeHtml(accountName(user))}</b>! 👋\n\n` +
    "Ro'yxatdan o'tishni yakunlash uchun pastdagi tugma orqali telefon raqamingizni yuboring.",
  foreignContact: "❗️ Iltimos, pastdagi tugma orqali <b>o'zingizning</b> raqamingizni yuboring.",
  phoneMismatch: (expected) =>
    `❗️ Yuborilgan raqam ro'yxatdan o'tishda kiritilgan raqamga mos kelmadi.\n\n` +
    `Iltimos, <b>${formatPhone(expected)}</b> raqamiga tegishli Telegram akkauntdan yoki shu raqamni yuboring.`,
  noPending:
    "Avval saytda ro'yxatdan o'ting — u yerdagi «Telegram'da tasdiqlash» tugmasi sizni shu botga olib keladi.",
  phoneTaken: (phone) =>
    `⚠️ ${formatPhone(phone)} raqami bilan hisob allaqachon mavjud.\n\nSaytda shu raqam orqali kiring.`,
  codeSent: (phone) =>
    `📱 Raqam qabul qilindi: <b>${formatPhone(phone)}</b>\n\nTasdiqlash kodi quyida 👇`,
  cooldown: (seconds) => `⏳ Yangi kodni ${seconds} soniyadan so'ng olishingiz mumkin.`,
  help:
    "ℹ️ <b>Yordam</b>\n\n" +
    botCommands.map(({ command, description }) => `/${command} — ${description.toLowerCase()}`).join('\n') +
    `\n\nKodlar ${CODE_TTL_MINUTES} daqiqa amal qiladi. Kodni hech kimga bermang — NAFIS xodimlari uni hech qachon so'ramaydi.`,
  login: (user) =>
    "🔑 <b>Saytga kirish</b>\n\n" +
    `1. ${CLIENT_URL}/auth/login sahifasini oching\n` +
    "2. «Telegram kod» bo'limini tanlang\n" +
    `3. Raqamingizni kiriting: <b>${formatPhone(user.phone)}</b>\n` +
    "4. Shu botga kelgan 6 xonali kodni saytga kiriting\n\n" +
    "Parolingizni bilsangiz, «Parol bilan» bo'limidan ham kirishingiz mumkin.",
  profile: (user) =>
    "👤 <b>Hisobingiz</b>\n\n" +
    `Telefon: <b>${formatPhone(user.phone) || '—'}</b>\n` +
    (user.username ? `Ism: <b>${escapeHtml(user.username)}</b>\n` : '') +
    (user.email ? `Email: <b>${escapeHtml(user.email)}</b>\n` : '') +
    "Holat: ✅ tasdiqlangan",
  pendingProfile: (user) =>
    "👤 <b>Hisobingiz</b>\n\n" +
    `Telefon: <b>${user.phone ? formatPhone(user.phone) : '—'}</b>\n` +
    (user.username ? `Ism: <b>${escapeHtml(user.username)}</b>\n` : '') +
    "Holat: ⏳ tasdiqlanmagan\n\n" +
    (user.phone
      ? "Botga kelgan kodni saytdagi tasdiqlash sahifasiga kiriting. Yangi kod uchun — /kod"
      : "Pastdagi tugma orqali telefon raqamingizni yuboring."),
  notLinked:
    "Bu Telegram akkaunt hali NAFIS hisobiga ulanmagan.\n\n" +
    `Ro'yxatdan o'tish: ${CLIENT_URL}/auth/register`,
  forgotNotLinked:
    "Parolni tiklash uchun avval shu Telegram akkaunt NAFIS hisobingizga ulangan bo'lishi kerak.\n\n" +
    `Agar hisobingiz bo'lsa, u bilan bir marta kiring yoki ro'yxatdan o'ting: ${CLIENT_URL}/auth/register`,
  forgotSent: (user) =>
    "🔄 <b>Parolni tiklash</b>\n\n" +
    `Tiklash kodi quyida yuborildi. Uni saytdagi parolni tiklash sahifasiga kiriting:\n${CLIENT_URL}/auth/forgot\n\n` +
    `Raqamingiz: <b>${formatPhone(user.phone)}</b>`,
  site:
    "🌸 <b>NAFIS</b>\n\n" +
    `🛍 Do'kon: ${CLIENT_URL}/shop/home\n` +
    `🔑 Kirish: ${CLIENT_URL}/auth/login\n` +
    `📝 Ro'yxatdan o'tish: ${CLIENT_URL}/auth/register`,
};

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Ko'rsatish uchun ism: foydalanuvchi nomi bo'lmasa, telefon raqam ishlatiladi
function accountName(user) {
  return user?.username || formatPhone(user?.phone) || 'foydalanuvchi';
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
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked) : texts.welcome);
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

  await sendMessage(chatId, texts.askContact(user), { reply_markup: contactKeyboard });
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
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked) : texts.noPending, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  const phone = normalizePhone(contact.phone_number);

  // Ro'yxatdan o'tishda kiritilgan raqam bilan yuborilgan raqam mos kelishi shart
  if (user.phone && user.phone !== phone) {
    await sendMessage(chatId, texts.phoneMismatch(user.phone), { reply_markup: contactKeyboard });
    return;
  }

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
    await sendMessage(chatId, linked ? texts.alreadyVerified(linked) : texts.noPending);
    return;
  }
  if (!user.phone) {
    await sendMessage(chatId, texts.askContact(user), { reply_markup: contactKeyboard });
    return;
  }

  const wait = getCooldownSeconds(user);
  if (wait > 0) {
    await sendMessage(chatId, texts.cooldown(wait));
    return;
  }
  await issueCode(user, 'verify');
}

// /forgot — ulangan hisob uchun parolni tiklash kodini yuborish
async function handleForgotCommand(message) {
  const chatId = message.chat.id;
  const user = await findVerifiedByChat(chatId);

  if (!user) {
    await sendMessage(chatId, texts.forgotNotLinked);
    return;
  }

  const wait = getCooldownSeconds(user);
  if (wait > 0) {
    await sendMessage(chatId, texts.cooldown(wait));
    return;
  }

  await sendMessage(chatId, texts.forgotSent(user));
  await issueCode(user, 'reset');
}

// /kirish — ulangan hisob uchun saytga kirish yo'riqnomasi
async function handleLoginCommand(message) {
  const chatId = message.chat.id;
  const linked = await findVerifiedByChat(chatId);
  if (linked) {
    await sendMessage(chatId, texts.login(linked));
    return;
  }
  const pending = await findPendingByChat(chatId);
  await sendMessage(chatId, pending ? texts.pendingProfile(pending) : texts.notLinked);
}

// /profil — shu chatga ulangan hisob
async function handleProfileCommand(message) {
  const chatId = message.chat.id;
  const linked = await findVerifiedByChat(chatId);
  if (linked) {
    await sendMessage(chatId, texts.profile(linked));
    return;
  }
  const pending = await findPendingByChat(chatId);
  if (!pending) {
    await sendMessage(chatId, texts.notLinked);
    return;
  }
  await sendMessage(
    chatId,
    texts.pendingProfile(pending),
    pending.phone ? {} : { reply_markup: contactKeyboard }
  );
}

// /stop va /obuna — aksiya (marketing) xabarlariga obunani boshqarish.
// Buyurtma holati kabi muhim xabarlar baribir yuboriladi.
async function handleSubscription(message, optIn) {
  const chatId = message.chat.id;
  const { rowCount } = await pool.query(
    'UPDATE users SET marketing_opt_in = $1 WHERE telegram_chat_id = $2 AND verify = TRUE',
    [optIn, chatId]
  );
  if (!rowCount) {
    await sendMessage(chatId, texts.notLinked);
    return;
  }
  await sendMessage(
    chatId,
    optIn
      ? "🔔 Aksiya va chegirmalar haqidagi xabarlar yoqildi. O'chirish uchun — /stop"
      : "🔕 Aksiya xabarlari o'chirildi. Buyurtmalaringiz holati haqida baribir xabar beramiz.\n\nQayta yoqish — /obuna"
  );
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
    case '/kirish':
    case '/login':
      await handleLoginCommand(message);
      break;
    case '/forgot':
    case '/parol':
      await handleForgotCommand(message);
      break;
    case '/profil':
    case '/me':
      await handleProfileCommand(message);
      break;
    case '/sayt':
    case '/site':
      await sendMessage(message.chat.id, texts.site);
      break;
    case '/stop':
    case '/unsubscribe':
      await handleSubscription(message, false);
      break;
    case '/obuna':
    case '/subscribe':
      await handleSubscription(message, true);
      break;
    case '/help':
    case '/yordam':
      await sendMessage(message.chat.id, texts.help);
      break;
    default: {
      const pending = await findPendingByChat(message.chat.id);
      if (pending && !pending.phone) {
        await sendMessage(message.chat.id, texts.askContact(pending), { reply_markup: contactKeyboard });
      } else {
        await sendMessage(message.chat.id, texts.help);
      }
    }
  }
}

let isRunning = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollUpdates() {
  let offset = 0;
  let failures = 0; // ketma-ket tarmoq xatolari soni

  while (isRunning) {
    try {
      const updates = await callTelegram('getUpdates', {
        offset,
        timeout: POLL_TIMEOUT_SECONDS,
        allowed_updates: ['message'],
      });

      if (failures > 0) {
        console.log('[telegram] Telegram bilan aloqa tiklandi, polling davom etmoqda');
        failures = 0;
      }

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
      if (error.code === 409) {
        await sleep(error.retryAfter ? error.retryAfter * 1000 : 5000);
        continue;
      }

      // Tarmoq xatolari ("fetch failed" va h.k.) ko'p takrorlanishi mumkin —
      // konsolni to'ldirmaslik uchun faqat birinchi va har 10-chi xatoni log qilamiz.
      failures += 1;
      if (failures === 1 || failures % 10 === 0) {
        console.error(
          `[telegram] Telegram'ga ulanib bo'lmadi (${failures}-urinish): ${error.message}. ` +
          `Internet/Telegram aloqasi tekshirilmoqda, avtomatik qayta urinilmoqda...`
        );
      }
      // Bosqichma-bosqich kutish: 2s, 4s, ... 30s gacha
      await sleep(Math.min(30000, 2000 * failures));
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
    await callTelegram('setMyCommands', { commands: botCommands });
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
