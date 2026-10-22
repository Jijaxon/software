// SEO va ijtimoiy tarmoqlarda ulashish.
// SPA'ni Telegram/Instagram/Google crawler'lari JS'siz o'qiydi, shuning uchun
// mahsulot preview'i (OG-meta) va sitemap serverda yasaladi.
const { pool } = require("../../db");
const { CLIENT_URL } = require("../../telegram/notify");
const { formatSom, roundSom } = require("../../services/pricing");

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// /api/seo/product/:id — OG-meta bilan sahifa; brauzer darhol mahsulot sahifasiga o'tadi
const productSharePage = async (req, res) => {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id);
    const product = isUuid
      ? (await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id])).rows[0]
      : null;
    const target = product ? `${CLIENT_URL}/shop/product/${product.id}` : `${CLIENT_URL}/shop/home`;

    if (!product) {
      return res.redirect(302, target);
    }

    const price = Number(product.price) || 0;
    const sale = Number(product.sale_price) || 0;
    const finalPrice = roundSom(price * (1 - sale / 100));
    const priceText = sale > 0 ? `${formatSom(finalPrice)} (−${sale}%)` : formatSom(price);
    const title = `${product.title} — ${priceText} | NAFIS`;
    const description = String(product.description || "NAFIS — original go'zallik mahsulotlari").slice(0, 200);
    const image = product.image ? `${CLIENT_URL}/api${product.image}` : "";

    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("Cache-Control", "public, max-age=600");
    res.send(`<!doctype html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <title>${escapeAttr(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${escapeAttr(target)}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="NAFIS">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
${image ? `  <meta property="og:image" content="${escapeAttr(image)}">` : ""}
  <meta property="og:url" content="${escapeAttr(target)}">
  <meta property="product:price:amount" content="${finalPrice}">
  <meta property="product:price:currency" content="UZS">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
${image ? `  <meta name="twitter:image" content="${escapeAttr(image)}">` : ""}
  <meta http-equiv="refresh" content="0; url=${escapeAttr(target)}">
</head>
<body>
  <p><a href="${escapeAttr(target)}">${escapeAttr(product.title)}</a></p>
  <script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`);
  } catch (e) {
    console.log(e);
    res.redirect(302, `${CLIENT_URL}/shop/home`);
  }
};

// /api/seo/sitemap.xml — qidiruv tizimlari uchun
const sitemap = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, updated_at FROM products ORDER BY updated_at DESC LIMIT 5000");
    const staticPages = ["/shop/home", "/shop/listing", "/shop/about", "/shop/quiz"];
    const urls = [
      ...staticPages.map((path) => `<url><loc>${CLIENT_URL}${path}</loc><changefreq>daily</changefreq></url>`),
      ...rows.map((row) =>
        `<url><loc>${CLIENT_URL}/shop/product/${row.id}</loc><lastmod>${new Date(row.updated_at).toISOString()}</lastmod></url>`
      ),
    ];
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (e) {
    console.log(e);
    res.status(500).send("");
  }
};

module.exports = { productSharePage, sitemap };
