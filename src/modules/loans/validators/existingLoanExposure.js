const { body } = require("express-validator");

/* =========================================================================
 * STEP 3 — Existing Loan Exposure (same two fields for every product)
 * =========================================================================
 * Two fields: existingEMI and existingLoanAmount.
 *
 *   config.exposureRequired = true  -> both are mandatory (Loan Against Property)
 *   config.exposureRequired = false -> both are optional, but must be >= 0
 * ========================================================================= */

const existingLoanExposureRules = (config) => {
  if (config.exposureRequired) {
    return [
      body("existingEMI").isFloat({ min: 0 }).withMessage("Existing total EMI is required (enter 0 if none)"),
      body("existingLoanAmount")
        .isFloat({ min: 0 })
        .withMessage("Existing loan amount is required (enter 0 if none)"),
    ];
  }

  const optionalAmount = (field, message) =>
    body(field).optional({ values: "null" }).isFloat({ min: 0 }).withMessage(message);

  return [
    optionalAmount("existingEMI", "Existing EMI must be a non-negative number"),
    optionalAmount("existingLoanAmount", "Existing loan amount must be a non-negative number"),
  ];
};

module.exports = { existingLoanExposureRules };
