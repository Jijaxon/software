const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware, updateProfile,
  verifyUser,
  resendVerificationCode
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logoutUser", logoutUser);
router.post("/verify", verifyUser)
router.post("/resend-verification", resendVerificationCode)
router.put("/update", authMiddleware,updateProfile);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user: user,
  })
})
module.exports = router;
