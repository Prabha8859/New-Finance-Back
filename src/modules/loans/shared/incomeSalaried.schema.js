const { requiredFor, requiredForSalaryBank } = require("../../../utils/employmentTypeRules");

/* =========================================================================
 * STEP 3 (part 1) — Income Details · Salaried
 * =========================================================================
 * Used by the Personal Loan, and by any product that accepts a salaried
 * applicant (Home Loan, LAP, Balance Transfer).
 *
 * `requiredFor("Salaried")` means: required ONLY when the applicant submitted
 * employmentType = "Salaried" — otherwise the field is stored as optional.
 * ========================================================================= */

const salariedIncomeFields = {
  companyName: String,
  companyType: String,
  companyTypeOther: String,
  monthlySalary: Number,
  salaryReceivedAs: String,
  salaryReceivedAsOther: String,
  salaryBankName: String,
  salaryBankOther: String,
};

/** Same fields, required when the applicant is Salaried (Personal Loan uses this set). */
const requiredSalariedIncomeFields = {
  ...salariedIncomeFields,
  companyName: { type: String, required: requiredFor("Salaried") },
  companyType: { type: String, required: requiredFor("Salaried") },
  monthlySalary: { type: Number, required: requiredFor("Salaried") },
  salaryReceivedAs: { type: String, required: requiredFor("Salaried") },
  salaryBankName: { type: String, required: requiredForSalaryBank },
};

const SALARIED_FIELD_NAMES = Object.keys(salariedIncomeFields);

module.exports = {
  salariedIncomeFields,
  requiredSalariedIncomeFields,
  SALARIED_FIELD_NAMES,
};
