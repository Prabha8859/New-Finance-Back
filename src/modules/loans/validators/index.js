const { body } = require("express-validator");

const { LOAN_PRODUCTS } = require("../loanProducts");
const handleValidationErrors = require("../../../shared/middleware/handleValidationErrors");

const { SALARIED, BUSINESS, PROFESSIONAL } = require("./helpers");
const { loanBasicsRules } = require("./loanBasics");
const { employmentTypeRules } = require("./employmentType");
const { existingLoanExposureRules } = require("./existingLoanExposure");
const { personalDetailsRules } = require("./personalDetails");
const { salariedIncomeRules } = require("./incomeSalaried");
const { selfEmployedIncomeRules } = require("./incomeSelfEmployed");
const { homeLoanRequirementRules } = require("./requirementsHomeLoan");
const { lapRequirementRules } = require("./requirementsLap");
const { balanceTransferRequirementRules } = require("./requirementsBalanceTransfer");
const { projectLoanRequirementRules } = require("./requirementsProjectLoan");
const { carLoanRequirementRules } = require("./requirementsCarLoan");
const { educationLoanRequirementRules } = require("./requirementsEducationLoan");
const { creditCardRequirementRules } = require("./requirementsCreditCard");

/* =========================================================================
 * LOAN VALIDATORS — READ THIS FIRST
 * =========================================================================
 *
 * Almost every loan application is checked in the same order, in these steps:
 *
 *   1. loanBasics.js               -> loanAmount + loanTenure
 *   2. requirements*.js            -> the extra fields of ONE product
 *                                     (Home Loan / LAP / Balance Transfer)
 *   3. existingLoanExposure.js     -> old EMI + old loan amounts
 *   4. employmentType.js           -> is this employment type allowed here?
 *   5. incomeSalaried.js / incomeSelfEmployed.js -> income fields
 *   6. personalDetails.js          -> name, mobile, email, PAN, address
 *
 * Every file above exports ONE function that returns a "rules array".
 * A rules array is just a simple list of express-validator checks, like:
 *
 *   [ body("fullName").notEmpty().withMessage("Full name is required") ]
 *
 * buildApplyValidator("home") joins the lists for one product into the single
 * middleware list a route uses:
 *
 *   router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
 *
 * If any check fails, handleValidationErrors replies 400 with the first message.
 *
 * Which steps a product uses comes from LOAN_PRODUCTS in ../loanProducts.js.
 * To change a rule, open only the one file for that step.
 * ========================================================================= */

/** Income rules depend on `income` in LOAN_PRODUCTS: "salaried" | "selfEmployed" | "employment". */
const incomeRules = (config) => {
  if (config.income === "salaried") return salariedIncomeRules(config);
  if (config.income === "selfEmployed") return selfEmployedIncomeRules(config);
  return [...salariedIncomeRules(config), ...selfEmployedIncomeRules(config)];
};

/** Loan Requirements — the one section that differs for each product. */
const requirementRules = {
  buyingProperty: homeLoanRequirementRules,
  collateralProperty: lapRequirementRules,
  balanceTransfer: balanceTransferRequirementRules,
  projectLoan: projectLoanRequirementRules,
  carLoan: carLoanRequirementRules,
  educationLoan: educationLoanRequirementRules,
  creditCard: creditCardRequirementRules,
};

/** Builds the full list of checks for one product. Used by the 5 *.validators.js files. */
const buildApplyValidator = (productKey) => {
  const config = LOAN_PRODUCTS[productKey];
  const requirements = config.loanRequirements ? requirementRules[config.loanRequirements]() : [];

  return [
    // 1. Loan Basics
    ...loanBasicsRules(config),
    // 2. Loan Requirements (empty for personal & business loans)
    ...requirements,
    // 3. Existing Loan Exposure
    ...existingLoanExposureRules(config),
    // 4. Employment Type
    ...employmentTypeRules(config),
    // 5. Income Details
    ...incomeRules(config),
    // 6. Personal Details
    ...personalDetailsRules(config),
    // The applicant must never send server-owned fields.
    body("status").not().exists().withMessage("status cannot be set by the applicant"),
    handleValidationErrors,
  ];
};

module.exports = { buildApplyValidator, SALARIED, BUSINESS, PROFESSIONAL };
