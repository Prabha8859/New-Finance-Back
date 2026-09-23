const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");

const applyValidator = [
  body("loanAmount")
    .isFloat({ min: 1 })
    .withMessage("Loan amount is required and must be a positive number"),
  body("loanTenure")
    .isInt({ min: 1 })
    .withMessage("Loan tenure is required and must be a positive number of years"),
  body("employmentType")
    .isIn(["Self Employed - Business", "Self Employed - Professional"])
    .withMessage("Employment type is invalid"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("mobile")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Enter a valid 10-digit mobile number"),
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("dob").isISO8601().withMessage("Enter a valid date of birth"),
  body("panNumber")
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage("Enter a valid PAN number"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("pincode")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode"),
  body("residenceStatus").trim().notEmpty().withMessage("Residence status is required"),
  body("status").not().exists().withMessage("status cannot be set by the applicant"),
  handleValidationErrors,
];

module.exports = { applyValidator };
