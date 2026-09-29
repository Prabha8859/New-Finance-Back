const { body } = require("express-validator");
const { otherIf, pincodeOrOtherCheck } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · LEASE RENTAL DISCOUNTING only
 * =========================================================================
 * The lease income / value numbers are optional (no "*" on the dashboard),
 * so each rule runs only when a value is actually sent.
 * The leased property's location is mandatory, and an "Other" pincode needs
 * its free-text partner field.
 * ========================================================================= */

const leaseRentalDiscountingRequirementRules = () => [
  body("monthlyLeaseIncome")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Monthly income through lease must be a positive number"),
  body("totalLeaseAmount")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Total amount to be received from lease must be a positive number"),
  body("leasePropertyDuration")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Lease property duration must be a positive number of years"),
  body("leasePropertyMarketValue")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Lease property market value must be a positive number"),
  body("leasePropertyAge")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Lease property age must be a positive number of years"),

  body("leasePropertyState").trim().notEmpty().withMessage("Lease property state is required"),
  body("leasePropertyCity").trim().notEmpty().withMessage("Lease property city is required"),
  body("leasePropertyPincode")
    .trim()
    .custom(pincodeOrOtherCheck("Enter a valid 6-digit lease property pincode")),
  otherIf("leasePropertyPincode", "leasePropertyPincodeOther", "Please mention lease property pincode"),
];

module.exports = { leaseRentalDiscountingRequirementRules };
