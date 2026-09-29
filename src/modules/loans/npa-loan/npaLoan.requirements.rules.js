const { body } = require("express-validator");
const { otherIf } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · NPA LOAN only
 * =========================================================================
 * The applicant is describing an EXISTING stressed account, so all three
 * fields are mandatory:
 *
 *   npaStatus                     — dropdown (1-6 Months ... Other)
 *   npaStatusOther                — free text, required only when "Other"
 *   npaPrincipalLoanAmount        — the original loan amount
 *   npaCurrentOutstandingAmount   — what is still due today
 *
 * Both amounts must be non-negative numbers (0 is allowed — e.g. a fully
 * recovered account reported as "Property Recovered By Bank").
 * ========================================================================= */

const npaLoanRequirementRules = () => [
  body("npaStatus").trim().notEmpty().withMessage("NPA status is required"),
  otherIf("npaStatus", "npaStatusOther", "Please mention the NPA status"),

  body("npaPrincipalLoanAmount")
    .isFloat({ min: 0 })
    .withMessage("NPA principal loan amount is required and must be a non-negative number"),

  body("npaCurrentOutstandingAmount")
    .isFloat({ min: 0 })
    .withMessage("NPA current outstanding amount is required and must be a non-negative number"),
];

module.exports = { npaLoanRequirementRules };
