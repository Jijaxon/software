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