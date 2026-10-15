# PostgreSQL sozlash

PostgreSQL'da avval bo'sh baza yarating:

```sql
CREATE DATABASE ecommerce;
```

`server/.env.example` namuna sifatida berilgan. Mavjud `server/.env` faylingizdagi boshqa sozlamalarni saqlagan holda unga `DATABASE_URL` qatorini qo'shing va login/parol hamda baza nomini moslang:

```env
DATABASE_URL=postgresql://postgres:parol@localhost:5432/ecommerce
```

`server/` papkasida quyidagini bajaring:

```sh
npm install
npm run db:init
```

Buyruq `db/schema.sql` dagi jadvallarni bazada yaratadi. Serverni `npm start` bilan ishga tushirganda ham schema avtomatik tekshiriladi va yetishmayotgan jadvallar yaratiladi. Mavjud jadvallar o'chirilmaydi.

Hozirgi sozlama yangi PostgreSQL bazasi uchun. Eski MongoDB ma'lumotlari avtomatik ko'chirilmaydi.
# Telegram bot orqali ro'yxatdan o'tish va kirish

Email o'rniga barcha tasdiqlash kodlari Telegram bot orqali yuboriladi.

1. Telegramda [@BotFather](https://t.me/BotFather) ga `/newbot` yuborib bot yarating va tokenni oling.
2. `server/.env` ga qo'shing:

   ```env
   TELEGRAM_BOT_TOKEN=123456789:AA...
   JWT_SECRET=uzun-va-tasodifiy-maxfiy-kalit
   ```

3. `npm start` — server bilan birga bot ham ishga tushadi (long polling, webhook yoki ochiq URL kerak emas).
   Bitta token bilan faqat bitta server nusxasi ishlashi kerak.

Oqim:

- **Ro'yxatdan o'tish:** saytda foydalanuvchi nomi va parol → «Telegram'da tasdiqlash» tugmasi botni ochadi →
  bot telefon raqamni so'raydi (tugma orqali) → bot 6 xonali kod yuboradi → kod saytga kiritiladi va foydalanuvchi tizimga kiradi.
- **Kirish:** telefon raqam + Telegram'ga kelgan kod (parolsiz) yoki telefon raqam/foydalanuvchi nomi + parol.
- Bot buyruqlari: `/start`, `/kod` (yangi kod), `/help`.
- Kodlar 5 daqiqa amal qiladi, 5 ta urinish, qayta yuborish oralig'i 60 soniya. Bazada faqat xeshi saqlanadi.

Token ko'rsatilmasa bot ishga tushmaydi va kodlar server konsoliga chiqariladi (faqat ishlab chiqish uchun).
Eski email bilan ro'yxatdan o'tgan hisoblar (masalan, admin) email + parol bilan kirishda davom etadi.

# Narxlar

Barcha narxlar **so'mda** saqlanadi va ko'rsatiladi. Stripe uchun `STRIPE_CURRENCY` (`uzs` yoki `usd`) ni tanlang.
