const User = require("../models/User");
const OTP = require("../models/OTP");
const generateToken = require("../utils/generateToken");
const sendOTP = require("../utils/sendOTP");

/*
==========================================
Register User & Send OTP
POST /api/auth/register
==========================================
*/

exports.register = async (req, res, next) => {
  try {
    const { name, mobile, email } = req.body;

    if (!name || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ mobile });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already registered. Please login instead.",
      });
    }

    const otp = process.env.STATIC_OTP || Math.floor(100000 + Math.random() * 900000).toString();

    // Remove old OTP
    await OTP.deleteMany({ mobile });

    // Save OTP
    await OTP.create({
      mobile,
      otp,
      expiresAt: new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 5) * 60 * 1000),
    });

    // Create or reuse temporary user record
    if (!user) {
      await User.create({
        name,
        mobile,
        email,
        isVerified: false,
      });
    }

    const otpSent = await sendOTP(mobile, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: user ? "OTP resent for verification" : "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Verify OTP
POST /api/auth/verify-otp
==========================================
*/

exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const otpData = await OTP.findOne({ mobile });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found",
      });
    }

    if (otpData.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({ mobile });

    user.isVerified = true;

    await user.save();

    await OTP.deleteMany({ mobile });

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Mobile Verified Successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Login
POST /api/auth/login
==========================================
*/

exports.login = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this mobile number. Please register first.",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account not verified. Please complete registration OTP verification first.",
      });
    }

    const otp = process.env.STATIC_OTP || Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ mobile });

    await OTP.create({
      mobile,
      otp,
      expiresAt: new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 5) * 60 * 1000),
    });

    const otpSent = await sendOTP(mobile, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Login OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Verify Login OTP
POST /api/auth/login/verify
==========================================
*/

exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const otpData = await OTP.findOne({ mobile });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({ mobile });

    user.lastLogin = new Date();

    user.isVerified = true;
    user.lastLogin = new Date();

    await user.save();

    await OTP.deleteMany({ mobile });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Profile
GET /api/auth/profile
==========================================
*/

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};