const { body } = require("express-validator");
const { otherIf, pincodeOrOtherCheck } = require("./helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · LOAN AGAINST PROPERTY only
 * =========================================================================
 * The collateral property IS the reason for this loan, so every field here
 * is mandatory (unlike the Home Loan version, where fields are optional).
 * ========================================================================= */

const lapRequirementRules = () => [
  body("collateralPropertyType")
    .trim()
    .notEmpty()
    .withMessage("Please select what you wish to take the loan against"),
  otherIf("collateralPropertyType", "collateralPropertyTypeOther", "Please mention collateral property type"),
  body("collateralPropertyMarketValue")
    .isFloat({ min: 1 })
    .withMessage("Collateral property market value is required"),
  body("collateralPropertyAge").isInt({ min: 0 }).withMessage("Collateral property age is required"),
  body("collateralPropertyState").trim().notEmpty().withMessage("Collateral property state is required"),
  body("collateralPropertyCity").trim().notEmpty().withMessage("Collateral property city is required"),
  body("collateralPropertyPincode")
    .trim()
    .custom(pincodeOrOtherCheck("Enter a valid 6-digit collateral property pincode")),
  otherIf("collateralPropertyPincode", "collateralPropertyPincodeOther", "Please mention collateral property pincode"),
];

module.exports = { lapRequirementRules };
