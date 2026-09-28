const router = require("express").Router();

const adminAuthController = require("./adminAuth.controller");
const adminAuth = require("../../shared/middleware/adminAuth");
const { adminLoginLimiter, otpRequestLimiter } = require("../../shared/middleware/rateLimit");
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("./adminAuth.validators");

/*
========================================
Public Routes
========================================
*/

// Admin Login (email + password)
router.post("/login", adminLoginLimiter, loginValidator, adminAuthController.login);

// Forgot Password (email OTP)
router.post("/forgot-password", otpRequestLimiter, forgotPasswordValidator, adminAuthController.forgotPassword);
router.post("/reset-password", resetPasswordValidator, adminAuthController.resetPassword);

/*
========================================
Protected Routes
========================================
*/

// Admin Profile
router.get("/profile", adminAuth, adminAuthController.profile);
router.put("/profile", adminAuth, adminAuthController.updateProfile);

// Change Password
router.put("/change-password", adminAuth, changePasswordValidator, adminAuthController.changePassword);

module.exports = router;
