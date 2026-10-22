# NAFIS backend (Node.js / Express + PostgreSQL)
# node:22 — require(ESM) to'liq qo'llab-quvvatlanadi (middleware/upload.js ESM)
FROM node:22-alpine

WORKDIR /app

# Avval faqat manifestlarni ko'chiramiz — qatlam keshi uchun
COPY package*.json ./
RUN npm install --omit=dev

# Qolgan manba kodi
COPY . .

# Yuklangan fayllar uchun papkalar (volume bo'sh bo'lsa ham mavjud bo'lishi uchun)
RUN mkdir -p uploads/products uploads/banners uploads/categories uploads/brands uploads/reviews uploads/broadcasts

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Har safar ishga tushganda papkalar borligini kafolatlaymiz (mounted volume uchun)
CMD ["sh", "-c", "mkdir -p uploads/products uploads/banners uploads/categories uploads/brands uploads/reviews uploads/broadcasts && node server.js"]
