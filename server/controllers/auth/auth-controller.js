const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

//register
const registerUser = async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const { username, email, password } = req.body;

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

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashPassword });
    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (e) {
    console.error("Register Error:", e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

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

module.exports = { registerUser, loginUser, updateProfile, logoutUser, authMiddleware };