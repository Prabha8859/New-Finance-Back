const { body } = require("express-validator");

/* =========================================================================
 * STEP 1 — Loan Basics (same idea for every product)
 * =========================================================================
 * Only two fields: loanAmount and loanTenure.
 * The minimum values are NOT written here — they come from the product config
 * in ../loanProducts.js, so every product can have its own limits.
 * ========================================================================= */

const loanBasicsRules = (config) => {
  // Credit Card has no amount/tenure — the config flags turn these checks off.
  const amountRequired = config.loanAmountRequired !== false;
  const tenureRequired = config.loanTenureRequired !== false;

  return [
    ...(amountRequired
      ? [body("loanAmount").isFloat({ min: config.loanAmountMin }).withMessage(config.loanAmountMessage)]
      : [body("loanAmount").optional({ values: "falsy" }).isFloat({ min: config.loanAmountMin }).withMessage(config.loanAmountMessage)]),
    ...(tenureRequired
      ? [body("loanTenure").isInt({ min: config.loanTenureMin }).withMessage(config.loanTenureMessage)]
      : [body("loanTenure").optional({ values: "falsy" }).isInt({ min: config.loanTenureMin }).withMessage(config.loanTenureMessage)]),
  ];
};

module.exports = { loanBasicsRules };
