const router = require("express").Router();

const authController = require("./auth.controller");
const auth = require("../../middleware/auth.middleware");
const { otpRequestLimiter, otpVerifyLimiter } = require("../../middleware/rateLimit.middleware");
const {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  verifyLoginOtpValidator,
} = require("./auth.validator");

/*
========================================
Public Routes
========================================
*/

// Register User & Send OTP
router.post("/register", otpRequestLimiter, registerValidator, authController.register);

// Verify Register OTP
router.post("/verify-otp", otpVerifyLimiter, verifyOtpValidator, authController.verifyOTP);

// Login & Send OTP
router.post("/login", otpRequestLimiter, loginValidator, authController.login);

// Verify Login OTP
router.post("/login/verify", otpVerifyLimiter, verifyLoginOtpValidator, authController.verifyLoginOTP);

/*
========================================
Protected Routes
========================================
*/

// User Profile
router.get("/profile", auth, authController.profile);

module.exports = router;
