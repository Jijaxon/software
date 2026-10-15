import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Narxni so'mda ko'rsatish: 125000 -> "125 000 so'm"
export function formatPrice(value) {
  const amount = Math.round(Number(value) || 0);
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
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
