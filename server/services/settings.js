const { pool } = require("../db");

// Standart qiymatlar — bazada kalit bo'lmasa ishlatiladi
const DEFAULTS = {
  delivery_fee: 25000,
  free_delivery_threshold: 150000,
  referral_bonus: 15000,
  abandoned_cart_enabled: true,
  abandoned_cart_hours: 3,
  abandoned_cart_discount: 10,
  low_stock_threshold: 5,
  flash_sale: { enabled: false, title: "", subtitle: "", endsAt: null },
};

// Har bir so'rovda bazaga bormaslik uchun qisqa muddatli kesh
let cache = null;
let cachedAt = 0;
const CACHE_MS = 30 * 1000;

async function getSettings() {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;
  const { rows } = await pool.query("SELECT key, value FROM settings");
  const settings = { ...DEFAULTS };
  for (const row of rows) settings[row.key] = row.value;
  cache = settings;
  cachedAt = Date.now();
  return settings;
}

// Faqat ma'lum kalitlarni yangilaymiz (ixtiyoriy kalit yozilib qolmasin)
async function updateSettings(partial) {
  const entries = Object.entries(partial || {}).filter(([key]) => key in DEFAULTS);
  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  }
  cache = null;
  return getSettings();
}

// Saytga ochiq bo'lishi mumkin bo'lgan qism (ichki marketing sozlamalarisiz)
function publicSettings(settings) {
  const flash = settings.flash_sale || {};
  const flashActive = Boolean(flash.enabled && flash.endsAt && new Date(flash.endsAt) > new Date());
  return {
    deliveryFee: Number(settings.delivery_fee) || 0,
    freeDeliveryThreshold: Number(settings.free_delivery_threshold) || 0,
    referralBonus: Number(settings.referral_bonus) || 0,
    lowStockThreshold: Number(settings.low_stock_threshold) || 5,
    flashSale: flashActive ? { title: flash.title, subtitle: flash.subtitle, endsAt: flash.endsAt } : null,
  };
}

module.exports = { getSettings, updateSettings, publicSettings, DEFAULTS };
