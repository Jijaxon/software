const { pool } = require("../../db");
const { toRecord, toRecords } = require("../../db/records");
const { deleteFiles } = require("../../middleware/upload");

// Nomdan slug yasaydi: "L'Oréal Paris" -> "l-oreal-paris"
function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseBool(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}

// table va rasm papkasiga qarab CRUD controller yaratadi (categories / brands uchun)
function createTaxonomyController({ table, uploadDir }) {
  const getAll = async (req, res) => {
    try {
      const onlyActive = parseBool(req.query.active, false);
      const sql = onlyActive
        ? `SELECT * FROM ${table} WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC`
        : `SELECT * FROM ${table} ORDER BY sort_order ASC, name ASC`;
      const data = toRecords((await pool.query(sql)).rows);
      res.status(200).json({ success: true, data });
    } catch (e) {
      console.log(e);
      res.status(500).json({ success: false, message: "Ma'lumotlarni olishda xatolik" });
    }
  };

  const create = async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Nom kiritilishi shart" });
      }

      const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
      if (!slug) {
        return res.status(400).json({ success: false, message: "Slug yaratib bo'lmadi, boshqa nom kiriting" });
      }

      const exists = (await pool.query(`SELECT 1 FROM ${table} WHERE slug = $1`, [slug])).rows[0];
      if (exists) {
        return res.status(409).json({ success: false, message: "Bunday slug allaqachon mavjud" });
      }

      const image = req.file ? `/uploads/${uploadDir}/${req.file.filename}` : "";
      const isActive = parseBool(req.body.isActive, true);
      const sortOrder = Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0;

      const data = toRecord((await pool.query(
        `INSERT INTO ${table} (name, slug, description, image, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name.trim(), slug, description || null, image, isActive, sortOrder]
      )).rows[0]);

      res.status(201).json({ success: true, data });
    } catch (e) {
      console.log(e);
      res.status(500).json({ success: false, message: "Yaratishda xatolik" });
    }
  };

  const update = async (req, res) => {
    try {
      const { id } = req.params;
      const current = toRecord((await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id])).rows[0]);
      if (!current) {
        return res.status(404).json({ success: false, message: "Topilmadi" });
      }

      const name = req.body.name?.trim() || current.name;
      const description = req.body.description ?? current.description;
      const isActive = parseBool(req.body.isActive, current.isActive);
      const sortOrder = req.body.sortOrder !== undefined && req.body.sortOrder !== ""
        ? Number(req.body.sortOrder)
        : current.sortOrder;

      // Slug faqat aniq yuborilganda o'zgaradi (mavjud mahsulotlar bog'lanishini buzmaslik uchun)
      let slug = current.slug;
      if (req.body.slug) {
        slug = slugify(req.body.slug);
        const clash = (await pool.query(`SELECT 1 FROM ${table} WHERE slug = $1 AND id <> $2`, [slug, id])).rows[0];
        if (clash) {
          return res.status(409).json({ success: false, message: "Bunday slug allaqachon mavjud" });
        }
      }

      let image = current.image;
      if (req.file) {
        image = `/uploads/${uploadDir}/${req.file.filename}`;
        if (current.image) await deleteFiles([current.image]);
      }

      const data = toRecord((await pool.query(
        `UPDATE ${table} SET name = $1, slug = $2, description = $3, image = $4,
         is_active = $5, sort_order = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
        [name, slug, description, image, isActive, sortOrder, id]
      )).rows[0]);

      res.status(200).json({ success: true, data });
    } catch (e) {
      console.log(e);
      res.status(500).json({ success: false, message: "Yangilashda xatolik" });
    }
  };

  const remove = async (req, res) => {
    try {
      const { id } = req.params;
      const current = toRecord((await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id])).rows[0]);
      if (!current) {
        return res.status(404).json({ success: false, message: "Topilmadi" });
      }

      if (current.image) await deleteFiles([current.image]);
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

      res.status(200).json({ success: true, message: "O'chirildi" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ success: false, message: "O'chirishda xatolik" });
    }
  };

  return { getAll, create, update, remove };
}

module.exports = { createTaxonomyController, slugify };
