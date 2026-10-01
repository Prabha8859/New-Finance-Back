const { body } = require("express-validator");
const { otherIf, pincodeOrOtherCheck } = require("../shared/helpers");

const fdiLoanRequirementRules = () => [
  body("collateralPropertyType")
    .trim()
    .notEmpty()
    .withMessage("Please select what you wish to take the fund against"),
  otherIf("collateralPropertyType", "collateralPropertyTypeOther", "Please mention collateral type"),
  body("collateralPropertyMarketValue")
    .isFloat({ min: 1 })
    .withMessage("Collateral market value must be a positive number"),
  body("collateralPropertyAge").isInt({ min: 0 }).withMessage("Collateral age is required"),
  body("collateralPropertyState").trim().notEmpty().withMessage("Collateral state is required"),
  body("collateralPropertyCity").trim().notEmpty().withMessage("Collateral city is required"),
  body("collateralPropertyPincode")
    .trim()
    .custom(pincodeOrOtherCheck("Enter a valid 6-digit collateral pincode")),
  otherIf("collateralPropertyPincode", "collateralPropertyPincodeOther", "Please enter the collateral pincode"),
];

module.exports = { fdiLoanRequirementRules };