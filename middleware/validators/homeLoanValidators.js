const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { EMPLOYMENT_TYPES } = require("../../constants/employmentTypes");

const requiredIf = (field, type, message) =>
  body(field).if(body("employmentType").equals(type)).trim().notEmpty().withMessage(message);

const applyValidator = [
  body("loanAmount").isFloat({ min: 1 }).withMessage("Loan amount is required and must be positive"),
  body("loanTenure").isInt({ min: 3 }).withMessage("Loan tenure must be at least 3 years"),
  body("buyingPropertyType").trim().notEmpty().withMessage("Buying property type is required"),
  body("buyingPropertyTypeOther")
    .if(body("buyingPropertyType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention buying property type"),
  body("buyingPropertyAge").isInt({ min: 0 }).withMessage("Buying property age is required"),
  body("buyingPropertyState").trim().notEmpty().withMessage("Buying property state is required"),
  body("buyingPropertyCity").trim().notEmpty().withMessage("Buying property city is required"),
  body("buyingPropertyPincode")
    .trim()
    .custom((value) => {
      if (value === "Other" || /^\d{6}$/.test(value)) return true;
      throw new Error("Enter a valid 6-digit property pincode");
    }),
  body("buyingPropertyPincodeOther")
    .if(body("buyingPropertyPincode").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention property pincode"),
  body("employmentType").isIn(EMPLOYMENT_TYPES.home).withMessage("Employment type is invalid"),
  requiredIf("companyName", "Salaried", "Company name is required"),
  requiredIf("companyType", "Salaried", "Company type is required"),
  body("companyTypeOther")
    .if(body("companyType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention company type"),
  body("monthlySalary")
    .if(body("employmentType").equals("Salaried"))
    .isFloat({ min: 0 })
    .withMessage("Monthly salary is required"),
  requiredIf("salaryReceivedAs", "Salaried", "Salary received as is required"),
  body("salaryReceivedAsOther")
    .if(body("salaryReceivedAs").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention salary received as"),
  requiredIf("businessType", "Self Employed - Business", "Business type is required"),
  body("businessTypeOther").if(body("businessType").equals("Other")).trim().notEmpty(),
  requiredIf("businessName", "Self Employed - Business", "Business name is required"),
  requiredIf("companyPanNumber", "Self Employed - Business", "Company PAN number is required"),
  requiredIf("natureOfBusiness", "Self Employed - Business", "Nature of business is required"),
  body("natureOfBusinessOther").if(body("natureOfBusiness").equals("Other")).trim().notEmpty(),
  requiredIf("industryType", "Self Employed - Business", "Industry type is required"),
  body("industryTypeOther").if(body("industryType").equals("Other")).trim().notEmpty(),
  body("businessEstablishedDate")
    .if(body("employmentType").equals("Self Employed - Business"))
    .custom((value) => {
      const text = String(value ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) && !/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
        throw new Error("Business establishment date is required");
      }
      return true;
    }),
  body("transactionBankName")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;

      const values = Array.isArray(value) ? value : [value];
      const invalidValue = values.some((item) => typeof item !== "string" || !String(item).trim());

      if (invalidValue) {
        throw new Error("Transaction bank name must be a string or an array of strings");
      }

      return true;
    }),
  body("transactionBankOther")
    .optional()
    .trim()
    .custom((value, { req }) => {
      const selected = req.body.transactionBankName;
      const list = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const shouldRequireCustomBank = list.some((item) => ["Other", "Multiple Transaction Banks"].includes(String(item).trim()));

      if (shouldRequireCustomBank && (!value || !String(value).trim())) {
        throw new Error("Please mention transaction bank name");
      }

      return true;
    }),
  requiredIf("profession", "Self Employed - Professional", "Profession is required"),
  body("currentYearTurnover").if(body("employmentType").equals("Self Employed - Professional")).isFloat({ min: 0 }),
  body("priorYearTurnover").if(body("employmentType").equals("Self Employed - Professional")).isFloat({ min: 0 }),
  body("currentYearNetIncome").if(body("employmentType").equals("Self Employed - Professional")).isFloat({ min: 0 }),
  body("previousYearNetIncome").if(body("employmentType").equals("Self Employed - Professional")).isFloat({ min: 0 }),
  body("lastYearTurnover").if(body("employmentType").equals("Self Employed - Business")).isFloat({ min: 0 }),
  body("lastYearNetIncome").if(body("employmentType").equals("Self Employed - Business")).isFloat({ min: 0 }),
  body("businessState").if(body("employmentType").not().equals("Salaried")).trim().notEmpty(),
  body("businessCity").if(body("employmentType").not().equals("Salaried")).trim().notEmpty(),
  body("businessPincode")
    .if(body("employmentType").not().equals("Salaried"))
    .trim()
    .custom((value) => {
      if (value === "Other" || /^\d{6}$/.test(value)) return true;
      throw new Error("Enter a valid business pincode");
    }),
  body("businessPincodeOther").if(body("businessPincode").equals("Other")).trim().notEmpty(),
  body("businessPlaceStatus").if(body("employmentType").not().equals("Salaried")).trim().notEmpty(),
  body("businessPlaceStatusOther").if(body("businessPlaceStatus").equals("Other")).trim().notEmpty(),
  body("existingEMI").isFloat({ min: 0 }).withMessage("Existing EMI is required"),
  body("existingLoanAmount").isFloat({ min: 0 }).withMessage("Existing loan amount is required"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("mobile").trim().matches(/^\d{10}$/).withMessage("Enter a valid mobile number"),
  body("email").trim().isEmail().withMessage("Enter a valid email"),
  body("dob").isISO8601().withMessage("Enter a valid date of birth"),
  body("panNumber").trim().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage("Enter a valid PAN"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("pincode").trim().matches(/^\d{6}$/).withMessage("Enter a valid pincode"),
  body("residenceStatus").trim().notEmpty().withMessage("Residence status is required"),
  body("status").not().exists().withMessage("status cannot be set by the applicant"),
  handleValidationErrors,
];

module.exports = { applyValidator };
