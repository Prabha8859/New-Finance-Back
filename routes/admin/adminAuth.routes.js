const router = require("express").Router();

const adminAuthController = require("../../controllers/admin/adminAuth.controller");
const adminAuth = require("../../middleware/adminAuth");
const { adminLoginLimiter, otpRequestLimiter } = require("../../middleware/rateLimit");
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("../../middleware/validators/adminAuthValidators");

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
