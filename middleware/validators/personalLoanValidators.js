const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

const applyValidator = [
  body("loanAmount")
    .isFloat({ min: 1 })
    .withMessage("Loan amount is required and must be a positive number"),
  body("loanTenure")
    .isInt({ min: 1 })
    .withMessage("Loan tenure is required and must be a positive number of months"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("mobile")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Enter a valid 10-digit mobile number"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email address"),
  body("dob").optional().isISO8601().withMessage("Enter a valid date of birth"),
  body("panNumber")
    .optional()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage("Enter a valid PAN number"),
  body("pincode")
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode"),
  body("existingEMI").optional().isFloat({ min: 0 }).withMessage("Existing EMI must be a non-negative number"),
  body("existingLoanAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Existing loan amount must be a non-negative number"),
  // status is server-assigned only — reject if a client tries to set it directly.
  body("status").not().exists().withMessage("status cannot be set by the applicant"),
  handleValidationErrors,
];

module.exports = { applyValidator };
