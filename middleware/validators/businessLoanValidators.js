const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { EMPLOYMENT_TYPES } = require("../../constants/employmentTypes");

const applyValidator = [
  body("loanAmount")
    .isFloat({ min: 1 })
    .withMessage("Loan amount is required and must be a positive number"),
  body("loanTenure")
    .isInt({ min: 1 })
    .withMessage("Loan tenure is required and must be a positive number of years"),
  body("employmentType")
    .isIn(EMPLOYMENT_TYPES.business)
    .withMessage("Employment type is invalid"),
  body("businessType")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .notEmpty()
    .withMessage("Business type is required"),
  body("businessTypeOther")
    .if(body("businessType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention business type"),
  body("businessName")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),
  body("natureOfBusiness")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .notEmpty()
    .withMessage("Nature of business is required"),
  body("natureOfBusinessOther")
    .if(body("natureOfBusiness").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention nature of business"),
  body("industryType")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .notEmpty()
    .withMessage("Industry type is required"),
  body("industryTypeOther")
    .if(body("industryType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention industry type"),
  body("companyPanNumber")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage("Enter a valid company PAN number"),
  body("businessEstablishedDate")
    .if(body("employmentType").equals("Self Employed - Business"))
    .custom((value) => {
      const text = String(value ?? "").trim();
      const isoDate = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text);
      const displayDate = /^\d{2}\/\d{2}\/\d{4}$/.test(text);
      if (!isoDate && !displayDate) throw new Error("Invalid date format");
      return true;
    })
    .withMessage("Business establishment date is required"),
  body("lastYearTurnover")
    .if(body("employmentType").equals("Self Employed - Business"))
    .isFloat({ min: 0 })
    .withMessage("Last year turnover is required"),
  body("lastYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Business"))
    .isFloat({ min: 0 })
    .withMessage("Last year net income is required"),
  body("transactionBankName").optional().trim(),
  body("transactionBankOther")
    .if(body("transactionBankName").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention transaction bank name"),
  body("profession")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .trim()
    .notEmpty()
    .withMessage("Profession is required"),
  body("currentYearTurnover")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Current year turnover is required"),
  body("priorYearTurnover")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Previous year turnover is required"),
  body("currentYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Current year net income is required"),
  body("previousYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Previous year net income is required"),
  body("businessState").trim().notEmpty().withMessage("Business state is required"),
  body("businessCity").trim().notEmpty().withMessage("Business city is required"),
  body("businessPincode")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit business pincode"),
  body("businessPlaceStatus")
    .trim()
    .notEmpty()
    .withMessage("Business place status is required"),
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
