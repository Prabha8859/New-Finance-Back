const mongoose = require("mongoose");
const { LOAN_PRODUCTS } = require("../loanProducts");

const { LOAN_FIELD_NAMES, SERVER_MANAGED_FIELD_NAMES } = require("./loanBasics");
const {
  personalDetailsFields,
  requiredPersonalDetailsFields,
  PERSONAL_DETAILS_FIELD_NAMES,
} = require("./personalDetails");
const {
  existingLoanExposureFields,
  EXPOSURE_FIELD_NAMES,
  MULTI_VALUE_EXPOSURE_FIELD_NAMES,
} = require("./existingLoanExposure");
const { requiredSalariedIncomeFields, SALARIED_FIELD_NAMES } = require("./incomeSalaried");
const {
  businessIncomeFields,
  SELF_EMPLOYED_FIELD_NAMES,
  PROFESSIONAL_FIELD_NAMES,
  BUSINESS_ADDRESS_FIELD_NAMES,
  TRANSACTION_BANK_FIELD_NAMES,
} = require("./incomeSelfEmployed");
const { employmentIncomeFields } = require("./incomeEmployment");
const { homeLoanRequirementFields } = require("./requirementsHomeLoan");
const { lapRequirementFields } = require("./requirementsLap");
const { balanceTransferRequirementFields } = require("./requirementsBalanceTransfer");
const { projectLoanRequirementFields } = require("./requirementsProjectLoan");
const { carLoanRequirementFields } = require("./requirementsCarLoan");
const { educationLoanRequirementFields } = require("./requirementsEducationLoan");
const { creditCardRequirementFields } = require("./requirementsCreditCard");

/* =========================================================================
 * LOAN SCHEMA — READ THIS FIRST
 * =========================================================================
 *
 * This folder says WHICH FIELDS each loan stores in MongoDB.
 * (The sibling ../validators folder says which of those fields are valid —
 *  same names, same order, same three shared sections. Keep the two in sync.)
 *
 * buildLoanSchema("home") joins these pieces, in this order:
 *
 *   1. loanBasics.js               -> loanAmount + loanTenure (+ server fields)
 *   2. requirements*.js            -> the extra fields of ONE product
 *                                     (Home Loan / LAP / Balance Transfer)
 *   3. incomeSalaried.js /
 *      incomeSelfEmployed.js /
 *      incomeEmployment.js         -> income fields (picked by config.income)
 *   4. existingLoanExposure.js     -> old EMI + old loan amounts
 *   5. personalDetails.js          -> name, mobile, email, PAN, address
 *
 * WHERE IS "LOAN REQUIREMENTS" DEFINED? (the part that differs per product)
 *
 *   requirementsHomeLoan.js             -> Home Loan
 *   requirementsLap.js                  -> Loan Against Property
 *   requirementsBalanceTransfer.js      -> Balance Transfer
 *   requirementsProjectLoan.js          -> Project Loan
 *   requirementsCarLoan.js              -> Car Loan
 *   requirementsEducationLoan.js        -> Education Loan
 *   requirementsCreditCard.js           -> Credit Card
 *
 * These are the ONLY per-product schema files. Personal Loan and Business Loan
 * have none, because they only use the shared sections above.
 *
 * HOW TO ADD A NEW LOAN PRODUCT (3 steps):
 *   1. Add a requirementsMyLoan.js here (if the product has extra fields).
 *   2. Register it in the two maps below (loanRequirementSections / ...FieldNames)
 *      AND in ../validators/index.js (requirementRules).
 *   3. Add one entry to ../loanProducts.js with the matching `loanRequirements` key.
 * ========================================================================= */

/** Key = LOAN_PRODUCTS[].income value. */
const incomeSections = {
  salaried: requiredSalariedIncomeFields,
  selfEmployed: businessIncomeFields,
  employment: employmentIncomeFields,
};

/** Key = LOAN_PRODUCTS[].loanRequirements value. */
const loanRequirementSections = {
  buyingProperty: homeLoanRequirementFields,
  collateralProperty: lapRequirementFields,
  balanceTransfer: balanceTransferRequirementFields,
  projectLoan: projectLoanRequirementFields,
  carLoan: carLoanRequirementFields,
  educationLoan: educationLoanRequirementFields,
  creditCard: creditCardRequirementFields,
};

/** Field names per requirement, used by the service to trim responses. */
const loanRequirementFieldNames = {
  buyingProperty: Object.keys(homeLoanRequirementFields),
  collateralProperty: Object.keys(lapRequirementFields),
  balanceTransfer: Object.keys(balanceTransferRequirementFields),
  projectLoan: Object.keys(projectLoanRequirementFields),
  carLoan: Object.keys(carLoanRequirementFields),
  educationLoan: Object.keys(educationLoanRequirementFields),
  creditCard: Object.keys(creditCardRequirementFields),
};

/** Which income fields actually apply to the submitted employment type. */
const incomeFieldNamesForEmploymentType = (employmentType) => {
  switch (String(employmentType || "").trim()) {
    case "Salaried":
      return [...SALARIED_FIELD_NAMES];
    case "Self Employed - Business":
      // The shared self-employed set also carries the professional-only fields.
      return SELF_EMPLOYED_FIELD_NAMES.filter((field) => !PROFESSIONAL_FIELD_NAMES.includes(field));
    case "Self Employed - Professional":
      return [
        ...PROFESSIONAL_FIELD_NAMES,
        ...BUSINESS_ADDRESS_FIELD_NAMES,
        ...TRANSACTION_BANK_FIELD_NAMES,
      ];
    default:
      return [];
  }
};

/** Builds a loan schema straight from its LOAN_PRODUCTS entry. */
const buildLoanSchema = (productKey) => {
  const config = LOAN_PRODUCTS[productKey];

  const requirementFields = config.loanRequirements ? loanRequirementSections[config.loanRequirements] : {};

  const personalDetails = config.personalDetailsRequired
    ? requiredPersonalDetailsFields
    : personalDetailsFields;

  return new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

      loanType: { type: String, enum: config.loanTypeEnum, default: config.loanType },

      // Credit Card has no amount/tenure — the config flags make them optional.
      ...(config.loanAmountRequired !== false
        ? { loanAmount: { type: Number, required: [true, "Loan amount is required"] } }
        : { loanAmount: { type: Number } }),
      ...(config.loanTenureRequired !== false
        ? { loanTenure: { type: Number, required: [true, "Loan tenure is required"] } }
        : { loanTenure: { type: Number } }),

      employmentType: {
        type: String,
        enum: config.employmentTypes,
        required: config.employmentTypeRequired ? [true, "Employment type is required"] : false,
        default: config.employmentTypeDefault,
      },

      ...requirementFields,
      ...incomeSections[config.income],
      ...existingLoanExposureFields,
      ...personalDetails,

      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Submitted"],
        default: "Submitted",
      },
    },
    { timestamps: true }
  );
};

module.exports = {
  buildLoanSchema,

  // Field-name lists, used by the service to copy / trim fields safely.
  LOAN_FIELD_NAMES,
  SERVER_MANAGED_FIELD_NAMES,
  PERSONAL_DETAILS_FIELD_NAMES,
  EXPOSURE_FIELD_NAMES,
  MULTI_VALUE_EXPOSURE_FIELD_NAMES,
  loanRequirementFieldNames,
  incomeFieldNamesForEmploymentType,

  // Field objects, used by tests.
  employmentIncomeFields,
  businessIncomeFields,
};
