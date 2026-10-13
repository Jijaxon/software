const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const { pool } = require('../../db');
const { toRecord } = require('../../db/records');

// email transporter (gmail misol)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// })

// random code generator
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

//register
const registerUser = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const { username, email, password } = req.body;

    const code = generateCode()

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkUser = toRecord((await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0]);
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists! Please try again",
      });
    }

    // send verification email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Verify your account',
    //   text: `Your verification code is: ${code}`
    // })

    console.log("======code: " + code);

    const hashPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (username, email, password, verify, verification_code) VALUES ($1, $2, $3, FALSE, $4)',
      [username, email, hashPassword, code]
    );

    res.status(200).json({
      success: true,
      message: "User registered. Check your email for verification code.",
    });
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({error: 'Email exists'})
    console.error("Register Error:", e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// verify
const verifyUser = async (req, res) => {
  const {email, code} = req.body

  try {
    const checkUser = toRecord((await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0]);
    console.log(checkUser);
    console.log(typeof code)
    console.log(checkUser.verificationCode);
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    if (checkUser.verify) {
      return res.json({
        success: false,
        message: "User already verified!",
      });
    }

    if (checkUser.verificationCode !== code)
      return res.json({
        success: false,
        message: "Invalid code!",
      });

    const updatedUser = toRecord((await pool.query(
      "UPDATE users SET verify = TRUE, verification_code = '', updated_at = NOW() WHERE id = $1 RETURNING *",
      [checkUser.id]
    )).rows[0]);
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        verify: updatedUser.verify
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
}

// resend verification code
const resendVerificationCode = async (req, res) => {
  const {email} = req.body

  try {
    const checkUser = toRecord((await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0]);
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    if (checkUser.verify)
      return res.json({
        success: false,
        message: "User already verified!",
      });

    const code = generateCode()

    // send verification email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Verify your account',
    //   text: `Your verification code is: ${code}`
    // })

    console.log("Verification code:", code);

    await pool.query('UPDATE users SET verification_code = $1, updated_at = NOW() WHERE id = $2', [code, checkUser.id]);
    res.json({
      success: true,
      message: "Verification code resent to email",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
}

//login
const loginUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const checkUser = toRecord((await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0]);
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    if (!checkUser.verify)
      return res.json({
        success: false,
        message: "Please verify your email!",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser.id,
        role: checkUser.role,
        email: checkUser.email,
        username: checkUser.username,
        verify: checkUser.verify
      },
      "CLIENT_SECRET_KEY",
      {expiresIn: "4h"}
    );

    res.cookie("token", token, {httpOnly: true, secure: false}).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser.id,
        username: checkUser.username,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
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
        message: "User not found",
      });
    }

    // Yangilanish bo'yicha tekshirishlar
    const hashed = password ? await bcrypt.hash(password, 12) : user.password;
    const updatedUser = toRecord((await pool.query(
      'UPDATE users SET username = $1, email = $2, password = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [username || user.username, email || user.email, hashed, userId]
    )).rows[0]);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

  } catch (e) {
    console.log("Update error:", e.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


//logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
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
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { registerUser, loginUser, updateProfile, logoutUser, authMiddleware, verifyUser, resendVerificationCode };