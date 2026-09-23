const sendOTP = async (mobile, otp) => {
  try {
    console.log("====================================");
    console.log("📱 Sending OTP...");
    console.log("Mobile :", mobile);
    console.log("OTP    :", otp);
    console.log("====================================");

    // Future Integration
    // MSG91
    // Twilio
    // Fast2SMS

    return true;
  } catch (error) {
    console.log("OTP Send Error :", error.message);
    return false;
  }
};

module.exports = sendOTP;