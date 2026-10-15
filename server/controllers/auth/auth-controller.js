const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../db');
const { toRecord } = require('../../db/records');
const { getBotUsername } = require('../../telegram/api');
const {
  generateLinkToken,
  normalizePhone,
  isValidUzPhone,
  getCooldownSeconds,
  issueCode,
  checkCode,
  clearCode,
} = require('../../telegram/codes');

const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

async function findUser(query, params) {
  return toRecord((await pool.query(query, params)).rows[0]);
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

// JWT cookie o'rnatib, foydalanuvchini tizimga kiritadi
function sendAuthCookie(res, user, message) {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      username: user.username,
      verify: user.verify,
    },
    JWT_SECRET,
    { expiresIn: "4h" }
  );

  res.cookie("token", token, { httpOnly: true, secure: false }).json({
    success: true,
    message,
    user: publicUser(user),
  });
}

async function buildTelegramLink(linkToken) {
  try {
    const botUsername = await getBotUsername();
    return botUsername ? `https://t.me/${botUsername}?start=${linkToken}` : null;
  } catch (e) {
    console.error("Telegram bot ma'lumotini olib bo'lmadi:", e.message);
    return null;
  }
}

// Tasdiqlanmagan foydalanuvchi uchun Telegram havolasini tayyorlaydi
async function ensureLinkToken(user) {
  if (user.telegramLinkToken) return user.telegramLinkToken;
  const linkToken = generateLinkToken();
  await pool.query(
    'UPDATE users SET telegram_link_token = $1, updated_at = NOW() WHERE id = $2',
    [linkToken, user.id]
  );
  return linkToken;
}

// Bot ma'lumoti (saytdagi "Botni ochish" tugmasi uchun)
const getTelegramInfo = async (req, res) => {
  try {
    const botUsername = await getBotUsername();
    res.json({
      success: true,
      botUsername,
      botLink: botUsername ? `https://t.me/${botUsername}` : null,
    });
  } catch (e) {
    res.json({ success: false, botUsername: null, botLink: null });
  }
};

//register
const registerUser = async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.json({ success: false, message: "Barcha maydonlarni to'ldiring" });
    }
    if (username.length < 3 || username.length > 32) {
      return res.json({ success: false, message: "Foydalanuvchi nomi 3–32 belgidan iborat bo'lsin" });
    }
    if (password.length < 6) {
      return res.json({ success: false, message: "Parol kamida 6 belgidan iborat bo'lsin" });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const linkToken = generateLinkToken();
    const existing = await findUser('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

    if (existing?.verify) {
      return res.json({ success: false, message: "Bu foydalanuvchi nomi band. Boshqasini tanlang" });
    }

    if (existing) {
      // Tasdiqlanmay qolgan ro'yxatdan o'tishni qayta boshlaymiz
      await pool.query(
        `UPDATE users SET username = $1, password = $2, telegram_link_token = $3, verification_code = '',
         code_expires_at = NULL, code_attempts = 0, updated_at = NOW() WHERE id = $4`,
        [username, hashPassword, linkToken, existing.id]
      );
    } else {
      await pool.query(
        `INSERT INTO users (username, password, verify, verification_code, telegram_link_token)
         VALUES ($1, $2, FALSE, '', $3)`,
        [username, hashPassword, linkToken]
      );
    }

    res.status(200).json({
      success: true,
      message: "Deyarli tayyor! Endi Telegram bot orqali tasdiqlang",
      token: linkToken,
      telegramLink: await buildTelegramLink(linkToken),
    });
  } catch (e) {
    if (e.code === '23505') {
      return res.json({ success: false, message: "Bu foydalanuvchi nomi band. Boshqasini tanlang" });
    }
    console.error("Register Error:", e.message);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
};

// Ro'yxatdan o'tish holati (tasdiqlash sahifasi uchun)
const getVerificationStatus = async (req, res) => {
  try {
    const user = await findUser(
      'SELECT * FROM users WHERE telegram_link_token = $1 AND verify = FALSE',
      [String(req.params.token || '')]
    );
    if (!user) {
      return res.json({ success: false, message: "Havola eskirgan. Qaytadan ro'yxatdan o'ting yoki kiring" });
    }
    res.json({
      success: true,
      username: user.username,
      telegramLinked: Boolean(user.telegramChatId),
      phoneShared: Boolean(user.phone),
      telegramLink: await buildTelegramLink(user.telegramLinkToken),
      cooldown: getCooldownSeconds(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
};

// verify — Telegram'ga kelgan kod bilan ro'yxatdan o'tishni yakunlash
const verifyUser = async (req, res) => {
  const { token, code } = req.body;

  try {
    const user = await findUser(
      'SELECT * FROM users WHERE telegram_link_token = $1 AND verify = FALSE',
      [String(token || '')]
    );
    if (!user) {
      return res.json({ success: false, message: "Havola eskirgan. Qaytadan ro'yxatdan o'ting yoki kiring" });
    }
    if (!user.telegramChatId || !user.phone) {
      return res.json({ success: false, message: "Avval Telegram botga o'tib, telefon raqamingizni yuboring" });
    }

    const result = await checkCode(user, code);
    if (!result.ok) return res.json({ success: false, message: result.message });

    const phoneOwner = await findUser(
      'SELECT id FROM users WHERE phone = $1 AND verify = TRUE AND id <> $2',
      [user.phone, user.id]
    );
    if (phoneOwner) {
      return res.json({ success: false, message: "Bu telefon raqam bilan hisob allaqachon mavjud. Kirish sahifasidan foydalaning" });
    }

    const verifiedUser = toRecord((await pool.query(
      `UPDATE users SET verify = TRUE, verification_code = '', code_expires_at = NULL, code_attempts = 0,
       telegram_link_token = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [user.id]
    )).rows[0]);

    sendAuthCookie(res, verifiedUser, "Hisobingiz tasdiqlandi. Xush kelibsiz!");
  } catch (e) {
    if (e.code === '23505') {
      return res.json({ success: false, message: "Bu Telegram akkaunt yoki raqam boshqa hisobga ulangan" });
    }
    console.log(e);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
}

// resend verification code — Telegram orqali yangi kod
const resendVerificationCode = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await findUser(
      'SELECT * FROM users WHERE telegram_link_token = $1 AND verify = FALSE',
      [String(token || '')]
    );
    if (!user) {
      return res.json({ success: false, message: "Havola eskirgan. Qaytadan ro'yxatdan o'ting yoki kiring" });
    }
    if (!user.telegramChatId || !user.phone) {
      return res.json({
        success: false,
        needsTelegram: true,
        telegramLink: await buildTelegramLink(user.telegramLinkToken),
        message: "Avval Telegram botga o'tib, telefon raqamingizni yuboring",
      });
    }

    const wait = getCooldownSeconds(user);
    if (wait > 0) {
      return res.json({ success: false, cooldown: wait, message: `Yangi kodni ${wait} soniyadan so'ng so'rashingiz mumkin` });
    }

    await issueCode(user, 'verify');
    res.json({ success: true, cooldown: 60, message: "Yangi kod Telegram'ga yuborildi" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Kodni yuborib bo'lmadi. Keyinroq urinib ko'ring" });
  }
}

//login — telefon raqam (yoki foydalanuvchi nomi / email) va parol bilan
const loginUser = async (req, res) => {
  const login = String(req.body.login || req.body.email || '').trim();
  const password = String(req.body.password || '');

  try {
    if (!login || !password) {
      return res.json({ success: false, message: "Login va parolni kiriting" });
    }

    const phone = normalizePhone(login);
    let checkUser;
    if (login.includes('@')) {
      checkUser = await findUser('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [login]);
    } else if (isValidUzPhone(phone)) {
      checkUser = await findUser(
        'SELECT * FROM users WHERE phone = $1 ORDER BY verify DESC, updated_at DESC LIMIT 1',
        [phone]
      );
    } else {
      checkUser = await findUser('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [login]);
    }

    if (!checkUser) {
      return res.json({ success: false, message: "Bunday foydalanuvchi topilmadi. Avval ro'yxatdan o'ting" });
    }

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch) {
      return res.json({ success: false, message: "Parol noto'g'ri. Qayta urinib ko'ring" });
    }

    if (!checkUser.verify) {
      const linkToken = await ensureLinkToken(checkUser);
      return res.json({
        success: false,
        needsVerification: true,
        token: linkToken,
        telegramLink: await buildTelegramLink(linkToken),
        message: "Hisobingiz hali tasdiqlanmagan. Telegram bot orqali tasdiqlang",
      });
    }

    sendAuthCookie(res, checkUser, "Xush kelibsiz!");
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
};

// Telegram orqali parolsiz kirish: 1-qadam — kod so'rash
const requestTelegramLogin = async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  try {
    if (!isValidUzPhone(phone)) {
      return res.json({ success: false, message: "Telefon raqamni to'g'ri kiriting" });
    }

    const user = await findUser(
      'SELECT * FROM users WHERE phone = $1 AND verify = TRUE AND telegram_chat_id IS NOT NULL',
      [phone]
    );
    if (!user) {
      return res.json({ success: false, message: "Bu raqam bilan Telegram'ga ulangan hisob topilmadi" });
    }

    const wait = getCooldownSeconds(user);
    if (wait > 0) {
      return res.json({ success: false, cooldown: wait, message: `Yangi kodni ${wait} soniyadan so'ng so'rashingiz mumkin` });
    }

    await issueCode(user, 'login');
    res.json({ success: true, cooldown: 60, message: "Kirish kodi Telegram'ga yuborildi" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Kodni yuborib bo'lmadi. Botni bloklamaganingizni tekshiring" });
  }
};

// Telegram orqali parolsiz kirish: 2-qadam — kodni tekshirish
const verifyTelegramLogin = async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  try {
    const user = await findUser(
      'SELECT * FROM users WHERE phone = $1 AND verify = TRUE AND telegram_chat_id IS NOT NULL',
      [phone]
    );
    if (!user) {
      return res.json({ success: false, message: "Bu raqam bilan Telegram'ga ulangan hisob topilmadi" });
    }

    const result = await checkCode(user, req.body.code);
    if (!result.ok) return res.json({ success: false, message: result.message });

    await clearCode(user.id);
    sendAuthCookie(res, user, "Xush kelibsiz!");
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Serverda xatolik yuz berdi" });
  }
};

//update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // token ichidan oldik
    const { username, email, password } = req.body;

    // Foydalanuvchini topish
    const user = toRecord((await pool.query('SELECT * FROM users WHERE id = $1', [userId])).rows[0]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    if (password && String(password).length < 6) {
      return res.json({ success: false, message: "Parol kamida 6 belgidan iborat bo'lsin" });
    }

    // Yangilanish bo'yicha tekshirishlar
    const hashed = password ? await bcrypt.hash(password, 12) : user.password;
    const updatedUser = toRecord((await pool.query(
      'UPDATE users SET username = $1, email = $2, password = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [username || user.username, email || user.email, hashed, userId]
    )).rows[0]);

    res.json({
      success: true,
      message: "Profil yangilandi",
      user: publicUser(updatedUser),
    });

  } catch (e) {
    if (e.code === '23505') {
      return res.json({ success: false, message: "Bu foydalanuvchi nomi band" });
    }
    console.log("Update error:", e.message);
    res.status(500).json({
      success: false,
      message: "Serverda xatolik yuz berdi",
    });
  }
};


//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Hisobdan chiqdingiz",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  logoutUser,
  authMiddleware,
  verifyUser,
  resendVerificationCode,
  getVerificationStatus,
  getTelegramInfo,
  requestTelegramLogin,
  verifyTelegramLogin,
};
