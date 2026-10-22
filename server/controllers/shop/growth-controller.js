const { pool } = require("../../db");
const { getSettings, publicSettings } = require("../../services/settings");
const { ensureReferralCode } = require("../../services/referral");
const { CLIENT_URL } = require("../../telegram/notify");

// Saytga ochiq sozlamalar: yetkazish narxi, bepul yetkazish chegarasi, flash-sale, referal bonusi
const getPublicSettings = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: publicSettings(await getSettings()) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Xatolik" });
  }
};

// Joriy foydalanuvchining referal ma'lumotlari
const getReferralInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const code = await ensureReferralCode(userId);
    const settings = await getSettings();

    const stats = (await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE referred_by = $1)::int AS invited,
         (SELECT COUNT(*) FROM users WHERE referred_by = $1 AND referral_rewarded)::int AS rewarded,
         (SELECT COALESCE(SUM(amount), 0) FROM bonus_transactions
            WHERE user_id = $1 AND reason = 'referral_inviter')::float AS earned,
         (SELECT bonus_balance FROM users WHERE id = $1)::float AS balance`,
      [userId]
    )).rows[0];

    res.status(200).json({
      success: true,
      data: {
        code,
        link: `${CLIENT_URL}/auth/register?ref=${code}`,
        bonus: Number(settings.referral_bonus) || 0,
        invited: stats.invited,
        rewarded: stats.rewarded,
        earned: stats.earned,
        balance: stats.balance,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Referal ma'lumotini olishda xatolik" });
  }
};

module.exports = { getPublicSettings, getReferralInfo };
