/* =========================================================================
 * STEP 4 — Existing Loan Exposure (same fields for every product)
 * =========================================================================
 * Optional everywhere except Loan Against Property, where existingEMI and
 * existingLoanAmount are required (LOAN_PRODUCTS.lap.exposureRequired).
 * ========================================================================= */

const existingLoanExposureFields = {
  existingEMI: { type: Number, default: 0 },
  existingLoanAmount: { type: Number, default: 0 },
  existingBanks: { type: [String], default: [] },
  otherBankList: { type: [String], default: [] },
  existingLoanTypes: { type: [String], default: [] },
  otherLoanList: { type: [String], default: [] },
};

const EXPOSURE_FIELD_NAMES = Object.keys(existingLoanExposureFields);

/** Exposure fields that hold a list of values (sent as a single value or a CSV). */
const MULTI_VALUE_EXPOSURE_FIELD_NAMES = [
  "existingBanks",
  "otherBankList",
  "existingLoanTypes",
  "otherLoanList",
];

module.exports = {
  existingLoanExposureFields,
  EXPOSURE_FIELD_NAMES,
  MULTI_VALUE_EXPOSURE_FIELD_NAMES,
};
