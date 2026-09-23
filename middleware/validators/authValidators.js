const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

const mobile = () =>
  body("mobile")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Enter a valid 10-digit mobile number");

const otp = () =>
  body("otp")
    .trim()
    .matches(/^\d{4,8}$/)
    .withMessage("Enter a valid OTP");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  mobile(),
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  handleValidationErrors,
];

const loginValidator = [mobile(), handleValidationErrors];

const verifyOtpValidator = [mobile(), otp(), handleValidationErrors];

const verifyLoginOtpValidator = [mobile(), otp(), handleValidationErrors];

module.exports = {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  verifyLoginOtpValidator,
};
