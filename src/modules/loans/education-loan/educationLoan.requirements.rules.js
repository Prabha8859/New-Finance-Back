const { body } = require("express-validator");
const { otherIf } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · EDUCATION LOAN only
 * =========================================================================
 * Every dashboard field here carries * (required). The three "Other" dropdowns
 * (country / field of study / enrollment status) must come with their
 * free-text partner when Other is picked.
 * ========================================================================= */

const educationLoanRequirementRules = () => [
  body("educationCountry").trim().notEmpty().withMessage("Please select the country for education"),
  otherIf("educationCountry", "educationCountryOther", "Please mention the country for education"),

  body("fieldOfStudy").trim().notEmpty().withMessage("Please select the field of study"),
  otherIf("fieldOfStudy", "fieldOfStudyOther", "Please mention the field of study"),

  body("courseName").trim().notEmpty().withMessage("Course name is required"),
  body("university").trim().notEmpty().withMessage("University is required"),
  body("instituteName").trim().notEmpty().withMessage("Institute name is required"),

  body("enrollmentStatus").trim().notEmpty().withMessage("Please select the enrollment status"),
  otherIf("enrollmentStatus", "enrollmentStatusOther", "Please mention the enrollment status"),

  body("courseDuration")
    .isFloat({ min: 0 })
    .withMessage("Course duration is required and must be a non-negative number"),
  body("educationCost")
    .isFloat({ min: 0 })
    .withMessage("Education cost is required and must be a non-negative number"),
];

module.exports = { educationLoanRequirementRules };
