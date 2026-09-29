const { body } = require("express-validator");
const { otherIf } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Credit Card Details · CREDIT CARD only
 * =========================================================================
 * Both dashboard fields have no * (optional), so the rules only run when a
 * value is sent. Picking "Other" in the bank dropdown requires the free-text
 * partner field.
 * ========================================================================= */

const creditCardRequirementRules = () => [
  body("hasActiveCard")
    .optional({ values: "falsy" })
    .trim()
    .isIn(["Yes", "No"])
    .withMessage("Select Yes or No for active credit card"),
  body("applyForBank")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Please select the bank you wish to apply for"),
  otherIf("applyForBank", "applyForBankOther", "Please mention the bank name"),
];

module.exports = { creditCardRequirementRules };
