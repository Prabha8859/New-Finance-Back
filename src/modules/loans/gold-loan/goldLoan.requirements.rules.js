const { body } = require("express-validator");
const { otherIf } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · GOLD LOAN only
 * =========================================================================
 * The pledged gold IS the security, so all four requirement fields are
 * mandatory:
 *
 *   typeOfLoan                      — Jewellery / Coin / Bar / Other
 *   typeOfLoanOther                 — free text, required only when "Other"
 *   goldCarats                      — 18 / 22 / 24 Karat / Other
 *   goldCaratsOther                 — free text, required only when "Other"
 *   goldWeight                      — approximate weight in grams (> 0)
 *   collateralPropertyMarketValue   — current gold market value (>= 0)
 * ========================================================================= */

const goldLoanRequirementRules = () => [
  body("typeOfLoan").trim().notEmpty().withMessage("Please select the type of loan"),
  otherIf("typeOfLoan", "typeOfLoanOther", "Please mention the type of loan"),

  body("goldCarats").trim().notEmpty().withMessage("Please select the gold karat"),
  otherIf("goldCarats", "goldCaratsOther", "Please mention the gold karat"),

  body("goldWeight")
    .isFloat({ min: 1 })
    .withMessage("Gold weight is required and must be a positive number (in grams)"),

  body("collateralPropertyMarketValue")
    .isFloat({ min: 0 })
    .withMessage("Current gold market value is required and must be a non-negative number"),
];

module.exports = { goldLoanRequirementRules };
