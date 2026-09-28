const { body } = require("express-validator");
const { otherIf } = require("./helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · CAR LOAN only
 * =========================================================================
 * Dashboard vehicle fields are optional, so every rule here runs only when a
 * value is actually sent (optional + "falsy" = skip "" and null).
 * An "Other" pick must come with its free-text partner field.
 * ========================================================================= */

const carLoanRequirementRules = () => [
  body("vehicleType")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Please select the vehicle type"),
  otherIf("vehicleType", "vehicleTypeOther", "Please mention the vehicle type"),

  body("transmissionType")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Please select the transmission type"),
  otherIf("transmissionType", "transmissionTypeOther", "Please mention the transmission type"),

  body("manufacturer")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Manufacturer is required"),

  body("model")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Model is required"),

  body("vehiclePurchaseType")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Please select whether you want a new or used vehicle"),
  otherIf("vehiclePurchaseType", "vehiclePurchaseTypeOther", "Please mention the vehicle purchase type"),
];

module.exports = { carLoanRequirementRules };
