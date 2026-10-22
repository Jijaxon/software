CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  verify BOOLEAN NOT NULL DEFAULT FALSE,
  verification_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT NOT NULL DEFAULT '',
  title TEXT,
  description TEXT,
  category TEXT,
  brand TEXT,
  price NUMERIC(12, 2),
  sale_price NUMERIC(12, 2),
  total_stock INTEGER,
  average_review NUMERIC(4, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT,
  city TEXT,
  pincode TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (wishlist_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  address_info JSONB NOT NULL DEFAULT '{}'::JSONB,
  order_status TEXT,
  payment_method TEXT,
  payment_status TEXT,
  total_amount NUMERIC(12, 2),
  order_date TIMESTAMPTZ,
  order_update_date TIMESTAMPTZ,
  payment_id TEXT,
  payer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  review_message TEXT,
  review_value NUMERIC(3, 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Manzilga tuman qo'shildi; pochta indeksi endi ishlatilmaydi (ixtiyoriy/eski)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS district TEXT;

CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);

-- Telegram bot orqali ro'yxatdan o'tish va kirish
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_link_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_sent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_attempts INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_verified_key ON users(phone) WHERE verify AND phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_chat_verified_key ON users(telegram_chat_id) WHERE verify AND telegram_chat_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_link_token_key ON users(telegram_link_token);
CREATE INDEX IF NOT EXISTS users_telegram_chat_id_idx ON users(telegram_chat_id);

-- Telefon raqam asosiy identifikatorga aylandi; foydalanuvchi nomi endi ixtiyoriy (faqat ko'rsatish uchun)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
-- Yuborilgan kodning maqsadi: 'verify' | 'login' | 'reset' (parolni tiklash kodini ajratish uchun)
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_purpose TEXT;

-- Go'zallik bo'limlari (kategoriyalar) — admin panel orqali boshqariladi
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brendlar — admin panel orqali boshqariladi
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS categories_active_idx ON categories(is_active);
CREATE INDEX IF NOT EXISTS brands_active_idx ON brands(is_active);

-- Mavjud mahsulotlardagi slug'lar ishlashda davom etishi uchun boshlang'ich qiymatlar
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Yuz parvarishi', 'skincare', 1),
  ('Makiyaj', 'makeup', 2),
  ('Atirlar', 'fragrance', 3),
  ('Soch parvarishi', 'haircare', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO brands (name, slug, sort_order) VALUES
  ('CeraVe', 'cerave', 1),
  ('The Ordinary', 'the-ordinary', 2),
  ('L''Oréal Paris', 'loreal', 3),
  ('Maybelline', 'maybelline', 4),
  ('Dior', 'dior', 5),
  ('Fenty Beauty', 'fenty-beauty', 6)
ON CONFLICT (slug) DO NOTHING;

-- ===================== Marketing va o'sish funksiyalari =====================

-- Do'kon sozlamalari (admin paneldan boshqariladi): kalit -> JSON qiymat
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('delivery_fee', '25000'),
  ('free_delivery_threshold', '150000'),
  ('referral_bonus', '15000'),
  ('abandoned_cart_enabled', 'true'),
  ('abandoned_cart_hours', '3'),
  ('abandoned_cart_discount', '10'),
  ('low_stock_threshold', '5'),
  ('flash_sale', '{"enabled": false, "title": "", "subtitle": "", "endsAt": null}')
ON CONFLICT (key) DO NOTHING;

-- Mahsulot: chegirma tugash vaqti (countdown) va sotilganlar soni (ijtimoiy isbot)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0;

-- Foydalanuvchi: referal, bonus balansi, til va reklama xabarlariga obuna
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_rewarded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_key ON users(referral_code);

-- Buyurtma: narx tarkibi (server hisoblaydi)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bonus_used NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Savat: tashlab ketilgan savat eslatmasi qachon yuborilgani
ALTER TABLE carts ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Sharhlar: rasmlar
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::JSONB;

-- Promokodlar
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER NOT NULL DEFAULT 1,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- shaxsiy kupon (masalan, savat eslatmasi)
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT NOT NULL DEFAULT 'admin', -- admin | abandoned_cart
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, order_id)
);
CREATE INDEX IF NOT EXISTS coupon_redemptions_user_idx ON coupon_redemptions(coupon_id, user_id);

-- Bonus harakatlari (referal mukofoti, xaridda ishlatish)
CREATE TABLE IF NOT EXISTS bonus_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  reason TEXT NOT NULL, -- referral_inviter | referral_invitee | order_spend
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bonus_transactions_user_idx ON bonus_transactions(user_id);

-- Telegram ommaviy xabarlar tarixi
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  image TEXT,
  button_text TEXT,
  button_url TEXT,
  status TEXT NOT NULL DEFAULT 'sending', -- sending | done
  total_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- Rus tili uchun kategoriya/brend nomlari (ixtiyoriy)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS name_ru TEXT;
UPDATE categories SET name_ru = v.ru FROM (VALUES
  ('skincare', 'Уход за лицом'), ('makeup', 'Макияж'), ('fragrance', 'Парфюмерия'), ('haircare', 'Уход за волосами')
) AS v(slug, ru) WHERE categories.slug = v.slug AND categories.name_ru IS NULL;
