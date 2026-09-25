const { body } = require("express-validator");
const handleValidationErrors = require("./handleValidationErrors");
const { EMPLOYMENT_TYPES } = require("../../constants/employmentTypes");

const requiredIf = (field, type, message) =>
  body(field).if(body("employmentType").equals(type)).trim().notEmpty().withMessage(message);

/**
 * Loan Against Property validation — mirrors the dashboard form rules
 * (sections: Loan Requirements, Income Details, Existing Loan Exposure, Personal Details).
 */
const applyValidator = [
  /* ---------- Loan Requirements ---------- */
  body("loanAmount")
    .isFloat({ min: 100000 })
    .withMessage("Minimum required loan amount is ₹1,00,000"),
  body("loanTenure")
    .isInt({ min: 3 })
    .withMessage("Select loan tenure (minimum 3 months)"),

  /* ---------- Collateral property (what you take the loan against) ---------- */
  body("collateralPropertyType")
    .trim()
    .notEmpty()
    .withMessage("Please select what you wish to take the loan against"),
  body("collateralPropertyTypeOther")
    .if(body("collateralPropertyType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention collateral property type"),
  body("collateralPropertyMarketValue")
    .isFloat({ min: 1 })
    .withMessage("Collateral property market value is required"),
  body("collateralPropertyAge")
    .isInt({ min: 0 })
    .withMessage("Collateral property age is required"),
  body("collateralPropertyState")
    .trim()
    .notEmpty()
    .withMessage("Collateral property state is required"),
  body("collateralPropertyCity")
    .trim()
    .notEmpty()
    .withMessage("Collateral property city is required"),
  body("collateralPropertyPincode")
    .trim()
    .custom((value) => {
      if (value === "Other" || /^\d{6}$/.test(value)) return true;
      throw new Error("Enter a valid 6-digit collateral property pincode");
    }),
  body("collateralPropertyPincodeOther")
    .if(body("collateralPropertyPincode").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention collateral property pincode"),

  /* ---------- Existing Loan Exposure ---------- */
  body("existingEMI")
    .isFloat({ min: 0 })
    .withMessage("Existing total EMI is required (enter 0 if none)"),
  body("existingLoanAmount")
    .isFloat({ min: 0 })
    .withMessage("Existing loan amount is required (enter 0 if none)"),

  /* ---------- Income Details ---------- */
  body("employmentType").isIn(EMPLOYMENT_TYPES.lap).withMessage("Employment type is invalid"),

  // Salaried
  requiredIf("companyName", "Salaried", "Company name is required"),
  requiredIf("companyType", "Salaried", "Company type is required"),
  body("companyTypeOther")
    .if(body("companyType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention company type"),
  body("monthlySalary")
    .if(body("employmentType").equals("Salaried"))
    .isFloat({ min: 12001 })
    .withMessage("Monthly net salary must be greater than 12,000"),
  requiredIf("salaryReceivedAs", "Salaried", "Select how salary is received"),
  body("salaryReceivedAsOther")
    .if(body("salaryReceivedAs").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention salary received as"),
  // Cash salaries have no bank — the dashboard skips this field in that case.
  body("salaryBankName")
    .if(body("employmentType").equals("Salaried"))
    .if(body("salaryReceivedAs").not().equals("Cash"))
    .trim()
    .notEmpty()
    .withMessage("Select salary bank name"),
  body("salaryBankOther")
    .if(body("salaryBankName").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention salary bank name"),

  // Self Employed - Business
  requiredIf("businessName", "Self Employed - Business", "Company full name is required"),
  requiredIf("businessType", "Self Employed - Business", "Company type is required"),
  body("businessTypeOther")
    .if(body("businessType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention company type"),
  body("gstNumber")
    .if(body("employmentType").equals("Self Employed - Business"))
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[0-9A-Z]{15}$/)
    .withMessage("Enter a valid 15-character GST number"),
  requiredIf("companyPanNumber", "Self Employed - Business", "Company PAN number is required"),
  body("companyPanNumber")
    .if(body("employmentType").equals("Self Employed - Business"))
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
    .withMessage("Enter a valid company PAN number"),
  requiredIf("natureOfBusiness", "Self Employed - Business", "Nature of business is required"),
  body("natureOfBusinessOther")
    .if(body("natureOfBusiness").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention nature of business"),
  requiredIf("industryType", "Self Employed - Business", "Industry type is required"),
  body("industryTypeOther")
    .if(body("industryType").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention industry type"),
  body("businessEstablishedDate")
    .if(body("employmentType").equals("Self Employed - Business"))
    .custom((value) => {
      const text = String(value ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) && !/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
        throw new Error("Date of business establishment is required");
      }
      return true;
    }),
  body("transactionBankName")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;

      if (typeof value === "string") {
        if (!value.trim()) throw new Error("Transaction bank name cannot be empty");
        return true;
      }

      if (Array.isArray(value)) {
        const invalidValue = value.some((item) => typeof item !== "string" || !String(item).trim());
        if (invalidValue) throw new Error("Transaction bank name must be a string or an array of strings");
        return true;
      }

      if (value && typeof value === "object") {
        if (typeof value.displayName !== "string" || !String(value.displayName).trim()) {
          throw new Error("Transaction bank display name is required");
        }
        if (!Array.isArray(value.banks) || value.banks.length === 0) {
          throw new Error("Transaction bank list is required");
        }
        const invalidBank = value.banks.some((item) => typeof item !== "string" || !String(item).trim());
        if (invalidBank) throw new Error("Transaction bank list must contain only valid bank names");
        return true;
      }

      throw new Error("Transaction bank name must be a string, array of strings, or bank object");
    }),
  body("transactionBankOther")
    .optional()
    .trim()
    .custom((value, { req }) => {
      const selected = req.body.transactionBankName;
      const list = Array.isArray(selected)
        ? selected
        : selected && typeof selected === "object" && Array.isArray(selected.banks)
          ? selected.banks
          : selected
            ? [selected]
            : [];
      const shouldRequireCustomBank = list.some((item) =>
        ["Other", "Multiple Transaction Banks"].includes(String(item).trim())
      );

      if (shouldRequireCustomBank && (!value || !String(value).trim())) {
        throw new Error("Please mention transaction bank name");
      }

      return true;
    }),
  body("lastYearTurnover")
    .if(body("employmentType").equals("Self Employed - Business"))
    .isFloat({ min: 0 })
    .withMessage("Last year turnover is required"),
  body("lastYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Business"))
    .isFloat({ min: 0 })
    .withMessage("Annual income cannot be zero"),

  // Self Employed - Professional
  requiredIf("profession", "Self Employed - Professional", "Profession is required"),
  body("professionOther")
    .if(body("profession").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention profession"),
  body("currentYearTurnover")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Current year turnover is required"),
  body("priorYearTurnover")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Last (2 years old) turnover is required"),
  body("currentYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Current year net income is required"),
  body("previousYearNetIncome")
    .if(body("employmentType").equals("Self Employed - Professional"))
    .isFloat({ min: 0 })
    .withMessage("Previous year net income is required"),

  // Business address (both self-employed types)
  body("businessState")
    .if(body("employmentType").isIn(["Self Employed - Business", "Self Employed - Professional"]))
    .trim()
    .notEmpty()
    .withMessage("Business state is required"),
  body("businessCity")
    .if(body("employmentType").isIn(["Self Employed - Business", "Self Employed - Professional"]))
    .trim()
    .notEmpty()
    .withMessage("Business city is required"),
  body("businessPincode")
    .if(body("employmentType").isIn(["Self Employed - Business", "Self Employed - Professional"]))
    .trim()
    .custom((value) => {
      if (value === "Other" || /^\d{6}$/.test(value)) return true;
      throw new Error("Enter a valid 6-digit business pincode");
    }),
  body("businessPincodeOther")
    .if(body("businessPincode").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention business pincode"),
  body("businessPlaceStatus")
    .if(body("employmentType").isIn(["Self Employed - Business", "Self Employed - Professional"]))
    .trim()
    .notEmpty()
    .withMessage("Status of business place is required"),
  body("businessPlaceStatusOther")
    .if(body("businessPlaceStatus").equals("Other"))
    .trim()
    .notEmpty()
    .withMessage("Please mention status of business place"),

  /* ---------- Personal Details ---------- */
  body("fullName").trim().notEmpty().withMessage("Name is required"),
  body("mobile").trim().matches(/^\d{10}$/).withMessage("Enter a valid 10-digit mobile number"),
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("dob")
    .isISO8601()
    .withMessage("Date of birth is required")
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dob > today) throw new Error("Date of birth cannot be in the future");

      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      if (dob > eighteenYearsAgo) throw new Error("Applicant must be at least 18 years old");

      return true;
    }),
  body("panNumber").trim().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/).withMessage("Enter a valid PAN number"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("pincode").trim().matches(/^\d{6}$/).withMessage("Enter a valid 6-digit pincode"),
  body("residenceStatus").trim().notEmpty().withMessage("Residence status is required"),
  body("status").not().exists().withMessage("status cannot be set by the applicant"),
  handleValidationErrors,
];

module.exports = { applyValidator };
