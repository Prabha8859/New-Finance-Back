const { body } = require("express-validator");
const { SALARIED, requiredIf, otherIf } = require("./helpers");

/* =========================================================================
 * STEP 5 (part 1) — Income Details · Salaried
 * =========================================================================
 * Used by the Personal Loan, and by any product that accepts a salaried
 * applicant (Home Loan, LAP, Balance Transfer).
 *
 * These rules only run when the applicant chose "Salaried" — the `.if(...)`
 * part is what makes them skip for Business / Professional applicants.
 * ========================================================================= */

const salariedIncomeRules = (config) => [
  requiredIf("companyName", SALARIED, "Company name is required"),
  requiredIf("companyType", SALARIED, "Company type is required"),
  otherIf("companyType", "companyTypeOther", "Please mention company type"),
  body("monthlySalary")
    .if(body("employmentType").equals(SALARIED))
    .isFloat({ min: config.salary.min })
    .withMessage(config.salary.message),
  requiredIf("salaryReceivedAs", SALARIED, "Salary received as is required"),
  otherIf("salaryReceivedAs", "salaryReceivedAsOther", "Please mention salary received as"),
  // A cash salary has no bank, so the dashboard skips this field in that case.
  body("salaryBankName")
    .if(body("employmentType").equals(SALARIED))
    .if(body("salaryReceivedAs").not().equals("Cash"))
    .trim()
    .notEmpty()
    .withMessage("Select salary bank name"),
  otherIf("salaryBankName", "salaryBankOther", "Please mention bank name"),
];

module.exports = { salariedIncomeRules };
