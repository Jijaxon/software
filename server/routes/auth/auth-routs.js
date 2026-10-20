const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware, updateProfile,
  verifyUser,
  resendVerificationCode,
  getVerificationStatus,
  getTelegramInfo,
  requestTelegramLogin,
  verifyTelegramLogin,
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logoutUser", logoutUser);
router.post("/verify", verifyUser)
router.post("/resend-verification", resendVerificationCode)
router.get("/verification-status/:token", getVerificationStatus)
router.get("/telegram-info", getTelegramInfo)
router.post("/telegram-login/request", requestTelegramLogin)
router.post("/telegram-login/verify", verifyTelegramLogin)
router.post("/forgot-password/request", requestPasswordReset)
router.post("/forgot-password/verify", verifyPasswordResetCode)
router.post("/forgot-password/reset", resetPassword)
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
