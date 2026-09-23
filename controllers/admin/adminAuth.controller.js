const adminAuthService = require("../../services/admin/adminAuth.service");

/*
==========================================
Admin Login
POST /api/admin/auth/login
==========================================
*/

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { token, admin } = await adminAuthService.authenticateAdmin(email, password);

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Admin Profile
GET /api/admin/auth/profile
==========================================
*/

exports.profile = async (req, res, next) => {
  try {
    const admin = await adminAuthService.getAdminById(req.admin.id);

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Forgot Password — Step 1: Send OTP
POST /api/admin/auth/forgot-password
==========================================
*/

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await adminAuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: "An OTP has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Forgot Password — Step 2: Verify OTP + Set New Password
POST /api/admin/auth/reset-password
==========================================
*/

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    await adminAuthService.resetPasswordWithOtp(email, otp, newPassword);

    res.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Change Password (authenticated)
PUT /api/admin/auth/change-password
==========================================
*/

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    await adminAuthService.changePassword(req.admin.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Update Profile (authenticated)
PUT /api/admin/auth/profile
==========================================
*/

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const admin = await adminAuthService.updateProfile(req.admin.id, { name, email });

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin,
    });
  } catch (error) {
    next(error);
  }
};
