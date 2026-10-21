const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

// Token orqali foydalanuvchini aniqlaydi (login talab qiladi)
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

// Faqat admin rolidagilar o'tadi (authMiddleware'dan keyin ishlatiladi)
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Ruxsat yo'q: faqat administrator uchun",
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
