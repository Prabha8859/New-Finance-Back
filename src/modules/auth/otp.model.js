const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);