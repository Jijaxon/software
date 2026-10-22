import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Valyuta yozuvi joriy tilga bog'liq (LanguageProvider o'rnatadi)
let currencySuffix = "so'm";
export function setPriceLocale(lang) {
  currencySuffix = lang === "ru" ? "сум" : "so'm";
}

// Narxni so'mda ko'rsatish: 125000 -> "125 000 so'm"
export function formatPrice(value) {
  const amount = Math.round(Number(value) || 0);
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${currencySuffix}`;
}

// Chegirma foizini hisobga olgan holda yakuniy narx
export function getFinalPrice(price, salePercent) {
  return Number(price || 0) * (1 - Number(salePercent || 0) / 100);
}

// 998901234567 -> "+998 90 123 45 67"
export function formatPhone(phone) {
  const match = /^998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone || "");
  return match ? `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone ? `+${phone}` : "";
}

// Ko'rsatish uchun ism: foydalanuvchi nomi bo'lmasa, telefon raqam ishlatiladi
export function displayName(user) {
  return user?.username || formatPhone(user?.phone) || user?.email || "Foydalanuvchi";
}

// ISO sana -> <input type="datetime-local"> qiymati (mahalliy vaqtda)
export function toDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

// <input type="datetime-local"> qiymati -> ISO (bo'sh bo'lsa null)
export function fromDateTimeLocal(value) {
  return value ? new Date(value).toISOString() : null;
}

// Sana va vaqtni qisqa ko'rinishda: "22.10.2026 14:30"
export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
