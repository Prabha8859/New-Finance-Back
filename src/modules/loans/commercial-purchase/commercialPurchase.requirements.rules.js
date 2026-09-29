const { body } = require("express-validator");
const { otherIf, pincodeOrOtherCheck } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · COMMERCIAL PURCHASE only
 * =========================================================================
 * These are the "buying property" fields for a commercial property.
 * Every field is optional so the applicant can save the form step by step,
 * but a value that IS sent is still checked (market value, pincode, "Other"
 * free text, etc.).
 * ========================================================================= */

const commercialPurchaseRequirementRules = () => [
  body("buyingPropertyType")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Buying property type is required"),
  otherIf("buyingPropertyType", "buyingPropertyTypeOther", "Please mention buying property type"),

  body("buyingPropertyMarketValue")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Buying property market value must be a positive number"),

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

module.exports = { commercialPurchaseRequirementRules };
