const { body } = require("express-validator");
const { otherIf, pincodeOrOtherCheck } = require("./helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · HOME LOAN only
 * =========================================================================
 * These are the "buying property" fields.
 * Every field is optional so the applicant can save the form step by step,
 * but a value that IS sent is still checked (pincode, "Other" free text, etc.).
 * ========================================================================= */

const homeLoanRequirementRules = () => [
  body("buyingPropertyType")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Buying property type is required"),
  otherIf("buyingPropertyType", "buyingPropertyTypeOther", "Please mention buying property type"),
  body("buyingPropertyAge")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Buying property age is required"),
  body("buyingPropertyState")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Buying property state is required"),
  body("buyingPropertyCity")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Buying property city is required"),
  body("buyingPropertyPincode")
    .optional({ values: "falsy" })
    .trim()
    .custom(pincodeOrOtherCheck("Enter a valid 6-digit property pincode")),
  otherIf("buyingPropertyPincode", "buyingPropertyPincodeOther", "Please mention property pincode"),
];

module.exports = { homeLoanRequirementRules };
