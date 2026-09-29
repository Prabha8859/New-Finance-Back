const { body } = require("express-validator");
const { PAN_PATTERN, MOBILE_PATTERN, PINCODE_PATTERN } = require("./helpers");

/* =========================================================================
 * STEP 6 — Personal Details (same fields for every product)
 * =========================================================================
 * fullName and mobile are ALWAYS required.
 * The rest become required only when config.personalDetailsRequired is true.
 * config.adultApplicant (Loan Against Property) also forces an 18+ date of birth.
 * ========================================================================= */

/** The applicant must be 18 or older, and the date of birth must be in the past. */
const adultApplicantCheck = (value) => {
  const dob = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(dob.getTime())) throw new Error("Enter a valid date of birth");
  if (dob > today) throw new Error("Date of birth cannot be in the future");

  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  if (dob > eighteenYearsAgo) throw new Error("Applicant must be at least 18 years old");

  return true;
};

const personalDetailsRules = (config) => {
  const required = config.personalDetailsRequired;
  const requiredOrOptional = (field) => (required ? body(field) : body(field).optional());

  const chain = [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("mobile").trim().matches(MOBILE_PATTERN).withMessage("Enter a valid 10-digit mobile number"),
    requiredOrOptional("email").trim().isEmail().withMessage("Enter a valid email address"),
    requiredOrOptional("dob").isISO8601().withMessage("Enter a valid date of birth"),
    requiredOrOptional("panNumber").trim().matches(PAN_PATTERN).withMessage("Enter a valid PAN number"),
  ];

  if (config.adultApplicant) {
    chain[3] = body("dob").isISO8601().withMessage("Date of birth is required").custom(adultApplicantCheck);
  }

  if (required) {
    chain.push(body("state").trim().notEmpty().withMessage("State is required"));
    chain.push(body("city").trim().notEmpty().withMessage("City is required"));
  }

  chain.push(
    requiredOrOptional("pincode").trim().matches(PINCODE_PATTERN).withMessage("Enter a valid 6-digit pincode")
  );

  if (required) {
    chain.push(body("residenceStatus").trim().notEmpty().withMessage("Residence status is required"));
  }

  return chain;
};

module.exports = { personalDetailsRules, adultApplicantCheck };
