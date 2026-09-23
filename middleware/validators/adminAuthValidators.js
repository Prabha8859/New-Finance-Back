const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

const loginValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  handleValidationErrors,
];

const resetPasswordValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("otp")
    .trim()
    .matches(/^\d{4,8}$/)
    .withMessage("Enter a valid OTP"),
  body("newPassword")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage("Password must be at least 8 characters and include a letter and a number"),
  handleValidationErrors,
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage("Password must be at least 8 characters and include a letter and a number"),
  handleValidationErrors,
];

module.exports = {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
