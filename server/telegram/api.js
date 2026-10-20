// Telegram Bot API bilan ishlash uchun yengil yordamchi (qo'shimcha kutubxonasiz)

// Ba'zi tarmoqlarda Node (undici) ishlamaydigan IPv6 manzilni tanlab "fetch failed"
// xatosini beradi — IPv4'ni afzal ko'rsak, bu muammo bartaraf bo'ladi.
try {
  require('dns').setDefaultResultOrder('ipv4first');
} catch {
  // eski Node versiyalarida bu funksiya bo'lmasligi mumkin — e'tiborsiz qoldiramiz
}

const TELEGRAM_API_URL = 'https://api.telegram.org';

let botInfo = null;

function getToken() {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

function isTelegramConfigured() {
  return Boolean(getToken());
}

async function callTelegram(method, params = {}, { signal } = {}) {
  const token = getToken();
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN .env faylida ko\'rsatilmagan');

  // Signal berilmagan bo'lsa, so'rov cheksiz osilib qolmasligi uchun o'zimiz to'xtatamiz.
  // Uzun so'rovlar (getUpdates timeout=N) uchun N + 10s kutamiz, aks holda 20s.
  let timer;
  if (!signal) {
    const controller = new AbortController();
    signal = controller.signal;
    const waitMs = (params.timeout ? params.timeout + 10 : 20) * 1000;
    timer = setTimeout(() => controller.abort(), waitMs);
  }

  try {
    const response = await fetch(`${TELEGRAM_API_URL}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!data.ok) {
      const error = new Error(data.description || `Telegram API xatosi: ${method}`);
      error.code = data.error_code || response.status;
      error.retryAfter = data.parameters?.retry_after;
      throw error;
    }
    return data.result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function sendMessage(chatId, text, extra = {}) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  });
}

async function getBotInfo() {
  if (botInfo) return botInfo;
  botInfo = await callTelegram('getMe');
  return botInfo;
}

// Bot username: avval .env dan, bo'lmasa getMe orqali olinadi
async function getBotUsername() {
  if (process.env.TELEGRAM_BOT_USERNAME) return process.env.TELEGRAM_BOT_USERNAME.replace(/^@/, '');
  if (!isTelegramConfigured()) return null;
  const info = await getBotInfo();
  return info.username;
}

module.exports = { callTelegram, sendMessage, getBotInfo, getBotUsername, isTelegramConfigured };
