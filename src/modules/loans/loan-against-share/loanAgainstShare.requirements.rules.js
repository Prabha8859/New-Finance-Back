const { body } = require("express-validator");

/* =========================================================================
 * STEP 2 — Loan Requirements · LOAN AGAINST SHARE only
 * =========================================================================
 * The shares ARE the security, so company / per-share value / quantity are
 * mandatory. `totalShareValue` is the dashboard's computed total, so it is
 * only checked when it is actually sent.
 * ========================================================================= */

const loanAgainstShareRequirementRules = () => [
  body("shareCompanyName").trim().notEmpty().withMessage("Share company name is required"),
  body("valueOfOneShare").isFloat({ min: 1 }).withMessage("Value of one share is required"),
  body("quantityOfShare").isInt({ min: 1 }).withMessage("Quantity of share is required"),
  body("totalShareValue")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Total share value must be a positive number"),
];

module.exports = { loanAgainstShareRequirementRules };
