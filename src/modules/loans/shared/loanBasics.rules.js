const { body } = require("express-validator");

/* =========================================================================
 * STEP 1 — Loan Basics (same idea for every product)
 * =========================================================================
 * Only two fields: loanAmount and loanTenure.
 * The limits are NOT written here — they come from the product config in
 * ./loanProducts.js, so every product can have its own range:
 *
 *   loanAmountMin, loanTenureMin   — lower bounds
 *   loanTenureMax                  — optional upper bound (e.g. OD/CC Limit
 *                                    allows a 3-40 year renewal tenure)
 *
 * `loanTenure` is always YEARS, so a dashboard "3-40 years" range is stored
 * in the config as min 3 / max 40.
 * ========================================================================= */

const loanBasicsRules = (config) => {
  // Credit Card has no amount/tenure — the config flags turn these checks off.
  const amountRequired = config.loanAmountRequired !== false;
  const tenureRequired = config.loanTenureRequired !== false;

  const tenureBounds = { min: config.loanTenureMin };
  if (config.loanTenureMax !== undefined) tenureBounds.max = config.loanTenureMax;

  return [
    ...(amountRequired
      ? [body("loanAmount").isFloat({ min: config.loanAmountMin }).withMessage(config.loanAmountMessage)]
      : [body("loanAmount").optional({ values: "falsy" }).isFloat({ min: config.loanAmountMin }).withMessage(config.loanAmountMessage)]),
    ...(tenureRequired
      ? [body("loanTenure").isInt(tenureBounds).withMessage(config.loanTenureMessage)]
      : [body("loanTenure").optional({ values: "falsy" }).isInt(tenureBounds).withMessage(config.loanTenureMessage)]),
  ];
};

module.exports = { loanBasicsRules };
