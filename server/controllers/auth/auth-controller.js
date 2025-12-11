const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// email transporter (gmail misol)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

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

    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists! Please try again",
      });
    }

    // send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your account',
      text: `Your verification code is: ${code}`
    })

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashPassword, verify: false, verification_code: code });
    await newUser.save();

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
    const checkUser = await User.findOne({email});
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

    if (checkUser.verification_code !== code)
      return res.json({
        success: false,
        message: "Invalid code!",
      });

    checkUser.verify = true
    checkUser.verification_code = ""

    await checkUser.save()
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
        role: checkUser.role,
        verify: checkUser.verify
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

//login
const loginUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const checkUser = await User.findOne({email});
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
        id: checkUser._id,
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
        id: checkUser._id,
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Yangilanish bo'yicha tekshirishlar
    if (username) user.username = username;
    if (email) user.email = email;

    // Agar parol o'zgartirilayotgan bo'lsa
    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      user.password = hashed;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
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

module.exports = { registerUser, loginUser, updateProfile, logoutUser, authMiddleware, verifyUser };