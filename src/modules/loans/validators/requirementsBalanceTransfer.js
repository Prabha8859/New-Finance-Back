const { body } = require("express-validator");
const { otherIf } = require("./helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · BALANCE TRANSFER only
 * =========================================================================
 * The type of loan being transferred is mandatory (that is the whole point of
 * this product). The property value (only for secured loans) and the top-up
 * are optional — but if sent, they must be non-negative numbers.
 * ========================================================================= */

const balanceTransferRequirementRules = () => [
  body("balanceTransferType").trim().notEmpty().withMessage("Please select the type of balance transfer"),
  otherIf("balanceTransferType", "balanceTransferTypeOther", "Please mention the type of balance transfer"),
  body("currentPropertyValue")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Current property value must be a non-negative number"),
  body("topUpAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Top-up amount must be a non-negative number"),
];

module.exports = { balanceTransferRequirementRules };
