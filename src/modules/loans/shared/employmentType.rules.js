const { body } = require("express-validator");

/* =========================================================================
 * STEP 4 — Employment Type
 * =========================================================================
 * Which employment types are allowed comes from the product config:
 *
 *   Personal Loan    -> "Salaried" only
 *   Business Loan    -> Business + Professional
 *   Home Loan / LAP / Balance Transfer -> all three
 *
 * Some products require the field; others default it (personal loan).
 * ========================================================================= */

const employmentTypeRules = (config) => {
  const rule = config.employmentTypeRequired ? body("employmentType") : body("employmentType").optional();
  return [rule.isIn(config.employmentTypes).withMessage(config.employmentTypeMessage)];
};

module.exports = { employmentTypeRules };
