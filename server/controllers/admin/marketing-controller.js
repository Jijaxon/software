const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const { getSettings, updateSettings } = require("../../services/settings");
const { startBroadcast, getAudienceCount } = require("../../services/broadcast");
const { slugify } = require("./taxonomy-controller");

// ---------------- Sozlamalar ----------------

const getAdminSettings = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: await getSettings() });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Sozlamalarni olishda xatolik" });
  }
};

const saveAdminSettings = async (req, res) => {
  try {
    const body = req.body || {};
    const numeric = ["delivery_fee", "free_delivery_threshold", "referral_bonus", "abandoned_cart_hours",
      "abandoned_cart_discount", "low_stock_threshold"];
    const patch = {};
    for (const key of numeric) {
      if (body[key] !== undefined) {
        const value = Number(body[key]);
        if (!Number.isFinite(value) || value < 0) {
          return res.status(400).json({ success: false, message: `Noto'g'ri qiymat: ${key}` });
        }
        patch[key] = value;
      }
    }
    if (body.abandoned_cart_enabled !== undefined) patch.abandoned_cart_enabled = Boolean(body.abandoned_cart_enabled);
    if (body.flash_sale !== undefined) {
      const flash = body.flash_sale || {};
      patch.flash_sale = {
        enabled: Boolean(flash.enabled),
        title: String(flash.title || "").slice(0, 120),
        subtitle: String(flash.subtitle || "").slice(0, 200),
        endsAt: flash.endsAt ? new Date(flash.endsAt).toISOString() : null,
      };
    }
    res.status(200).json({ success: true, data: await updateSettings(patch) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Sozlamalarni saqlashda xatolik" });
  }
};

// ---------------- Promokodlar ----------------

function normalizeCode(code) {
  return slugify(code).replace(/-/g, "").toUpperCase().slice(0, 32);
}

function parseCouponBody(body) {
  const discountType = body.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) return { error: "Chegirma qiymati musbat bo'lsin" };
  if (discountType === "percent" && discountValue > 100) return { error: "Foiz 100 dan oshmasin" };

  const toIntOrNull = (v) => (v === "" || v === null || v === undefined ? null : Math.max(0, Math.floor(Number(v))));
  const toDateOrNull = (v) => (v ? new Date(v).toISOString() : null);

  return {
    value: {
      description: body.description || null,
      discountType,
      discountValue,
      minOrder: Math.max(0, Number(body.minOrder) || 0),
      maxUses: toIntOrNull(body.maxUses),
      perUserLimit: toIntOrNull(body.perUserLimit) ?? 1,
      startsAt: toDateOrNull(body.startsAt),
      expiresAt: toDateOrNull(body.expiresAt),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    },
  };
}

const listCoupons = async (req, res) => {
  try {
    const includePersonal = req.query.personal === "true";
    const { rows } = await pool.query(
      `SELECT c.*, COALESCE(SUM(r.discount_amount), 0)::float AS total_discount
       FROM coupons c LEFT JOIN coupon_redemptions r ON r.coupon_id = c.id
       ${includePersonal ? "" : "WHERE c.source = 'admin'"}
       GROUP BY c.id ORDER BY c.created_at DESC`
    );
    res.status(200).json({ success: true, data: toRecords(rows) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Promokodlarni olishda xatolik" });
  }
};

const createCoupon = async (req, res) => {
  try {
    const code = normalizeCode(req.body.code);
    if (!code) return res.status(400).json({ success: false, message: "Promokod kiriting (lotin harf va raqam)" });
    const { value, error } = parseCouponBody(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const exists = (await pool.query("SELECT 1 FROM coupons WHERE code = $1", [code])).rows[0];
    if (exists) return res.status(409).json({ success: false, message: "Bunday promokod mavjud" });

    const data = toRecord((await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_uses,
       per_user_limit, starts_at, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [code, value.description, value.discountType, value.discountValue, value.minOrder, value.maxUses,
        value.perUserLimit, value.startsAt, value.expiresAt, value.isActive]
    )).rows[0]);
    res.status(201).json({ success: true, data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Promokod yaratishda xatolik" });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const current = (await pool.query("SELECT * FROM coupons WHERE id = $1", [id])).rows[0];
    if (!current) return res.status(404).json({ success: false, message: "Topilmadi" });

    // Qisman yangilash (masalan, faqat isActive) boshqa maydonlarni o'chirib yubormasligi uchun
    // yuborilmagan maydonlar joriy qiymatdan olinadi
    const { value, error } = parseCouponBody({
      description: current.description,
      discountType: current.discount_type,
      discountValue: current.discount_value,
      minOrder: current.min_order,
      maxUses: current.max_uses,
      perUserLimit: current.per_user_limit,
      startsAt: current.starts_at,
      expiresAt: current.expires_at,
      isActive: current.is_active,
      ...req.body,
    });
    if (error) return res.status(400).json({ success: false, message: error });

    const data = toRecord((await pool.query(
      `UPDATE coupons SET description = $1, discount_type = $2, discount_value = $3, min_order = $4,
       max_uses = $5, per_user_limit = $6, starts_at = $7, expires_at = $8, is_active = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [value.description, value.discountType, value.discountValue, value.minOrder, value.maxUses,
        value.perUserLimit, value.startsAt, value.expiresAt, value.isActive, id]
    )).rows[0]);
    res.status(200).json({ success: true, data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Promokodni yangilashda xatolik" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM coupons WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: "Topilmadi" });
    res.status(200).json({ success: true, message: "O'chirildi" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "O'chirishda xatolik" });
  }
};

// ---------------- Telegram broadcast ----------------

const listBroadcasts = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 30");
    res.status(200).json({
      success: true,
      data: { audience: await getAudienceCount(), broadcasts: toRecords(rows) },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Ma'lumot olishda xatolik" });
  }
};

const createBroadcast = async (req, res) => {
  try {
    const message = String(req.body.message || "").trim();
    if (!message) return res.status(400).json({ success: false, message: "Xabar matnini kiriting" });
    const limit = req.file ? 900 : 3800; // rasm izohi 1024 belgigacha
    if (message.length > limit) {
      return res.status(400).json({ success: false, message: `Xabar ${limit} belgidan oshmasin` });
    }

    const broadcast = await startBroadcast({
      message,
      imagePath: req.file ? `/uploads/broadcasts/${req.file.filename}` : null,
      buttonText: req.body.buttonText,
      buttonUrl: req.body.buttonUrl,
      createdBy: req.user?.id,
    });
    res.status(201).json({ success: true, data: toRecord(broadcast) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: e.message || "Yuborishda xatolik" });
  }
};

module.exports = {
  getAdminSettings,
  saveAdminSettings,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listBroadcasts,
  createBroadcast,
};
