const {
  requiredFor,
  requiredForSalaryBank,
  requiredForSelfEmployed,
} = require("../../../shared/utils/employmentTypeRules");
const { salariedIncomeFields } = require("./incomeSalaried");
const { businessIncomeFields } = require("./incomeSelfEmployed");

/* =========================================================================
 * STEP 3 (part 3) — Income Details · ALL THREE employment types combined
 * =========================================================================
 * Used by the products that accept every employment type:
 * Home Loan, Loan Against Property, Balance Transfer
 * (LOAN_PRODUCTS[].income === "employment").
 *
 * It is simply salaried + self-employed. The number fields get a conditional
 * default, so only the fields that belong to the submitted employmentType end
 * up stored on the document.
 * ========================================================================= */

const employmentIncomeFields = {
  ...salariedIncomeFields,
  ...businessIncomeFields,

  /* Salaried — required only when employmentType === "Salaried" */
  companyName: { type: String, required: requiredFor("Salaried") },
  companyType: { type: String, required: requiredFor("Salaried") },
  monthlySalary: { type: Number, required: requiredFor("Salaried") },
  salaryReceivedAs: { type: String, required: requiredFor("Salaried") },
  salaryBankName: { type: String, required: requiredForSalaryBank },

  /* Professional — required (and defaulted to 0) only for that type */
  currentYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  priorYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  currentYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  previousYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },

  /* Business — required (and defaulted to 0) only for that type */
  lastYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
  },
  lastYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
  },

  /* Business address — both self-employed types */
  businessState: { type: String, trim: true, required: requiredForSelfEmployed },
  businessCity: { type: String, trim: true, required: requiredForSelfEmployed },
  businessPincode: { type: String, trim: true, required: requiredForSelfEmployed },
  businessPlaceStatus: { type: String, trim: true, required: requiredForSelfEmployed },
};

module.exports = { employmentIncomeFields };
