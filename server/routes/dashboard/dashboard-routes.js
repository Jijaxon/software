const express = require("express");

const {dashboard} = require("../../controllers/dashboard/dashboard-controller")
const {authMiddleware, adminMiddleware} = require("../../middleware/auth")

const router = express.Router();


router.get("/", authMiddleware, adminMiddleware, dashboard)

module.exports = router