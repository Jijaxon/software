// Dollarda kiritilgan mahsulot narxlarini so'mga o'tkazadi.
// Ishlatish: npm run prices:uzs            (kurs .env dagi UZS_PER_USD yoki 12700)
//            npm run prices:uzs -- 12850    (kursni qo'lda berish)
// Qayta ishga tushirish xavfsiz: faqat narxi 10 000 dan past (ya'ni hali dollardagi) mahsulotlar o'zgaradi.
require('dotenv').config();
const { pool } = require('../db');

const USD_PRICE_LIMIT = 10000;
const rate = Number(process.argv[2]) || Number(process.env.UZS_PER_USD) || 12700;

async function main() {
  const { rows } = await pool.query(
    `UPDATE products
     SET price = ROUND(price * $1 / 100) * 100, updated_at = NOW()
     WHERE price IS NOT NULL AND price > 0 AND price < $2
     RETURNING title, price`,
    [rate, USD_PRICE_LIMIT]
  );

  console.log(`Kurs: 1 USD = ${rate} so'm. ${rows.length} ta mahsulot so'mga o'tkazildi.`);
  rows.forEach((row) => console.log(` • ${row.title}: ${Number(row.price).toLocaleString('ru-RU')} so'm`));
}

main()
  .catch((error) => {
    console.error("Narxlarni o'tkazib bo'lmadi:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
