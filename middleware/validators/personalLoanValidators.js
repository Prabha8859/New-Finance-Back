const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { EMPLOYMENT_TYPES } = require("../../constants/employmentTypes");

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
  body("employmentType")
    .optional()
    .isIn(EMPLOYMENT_TYPES.personal)
    .withMessage("Employment type must be Salaried"),
  body("companyName").if(body("employmentType").equals("Salaried")).trim().notEmpty().withMessage("Company name is required"),
  body("companyType").if(body("employmentType").equals("Salaried")).trim().notEmpty().withMessage("Company type is required"),
  body("companyTypeOther")
    .optional()
    .trim()
    .if(body("companyType").equals("Other"))
    .notEmpty()
    .withMessage("Please mention company type"),
  body("monthlySalary")
    .if(body("employmentType").equals("Salaried"))
    .isFloat({ min: 0 })
    .withMessage("Monthly salary must be a non-negative number"),
  body("salaryReceivedAs")
    .if(body("employmentType").equals("Salaried"))
    .trim()
    .notEmpty()
    .withMessage("Salary received as is required"),
  body("salaryReceivedAsOther")
    .optional()
    .trim()
    .if(body("salaryReceivedAs").equals("Other"))
    .notEmpty()
    .withMessage("Please mention salary received as"),
  body("salaryBankName")
    .if(body("employmentType").equals("Salaried"))
    .trim()
    .notEmpty()
    .withMessage("Select salary bank name"),
  body("salaryBankOther")
    .optional()
    .trim()
    .if(body("salaryBankName").equals("Other"))
    .notEmpty()
    .withMessage("Please mention bank name"),
  body("existingEMI").optional().isFloat({ min: 0 }).withMessage("Existing EMI must be a non-negative number"),
  body("existingLoanAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Existing loan amount must be a non-negative number"),
  body("status").not().exists().withMessage("status cannot be set by the applicant"),
  handleValidationErrors,
];

module.exports = { applyValidator };
