const { body } = require("express-validator");
const { otherIf, DATE_PATTERN } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · PROJECT LOAN only
 * =========================================================================
 * A project loan is always against a real project, so every field here is
 * mandatory (like LAP). Dates may arrive as YYYY-MM-DD or DD/MM/YYYY — the
 * service converts DD/MM/YYYY to YYYY-MM-DD before saving.
 * ========================================================================= */

/** Required date that accepts YYYY-MM-DD or DD/MM/YYYY (like businessEstablishedDate). */
const requiredDate = (field, requiredMessage, invalidMessage) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(requiredMessage)
    .custom((value) => {
      if (!DATE_PATTERN.test(String(value ?? "").trim())) throw new Error(invalidMessage);
      return true;
    });

const projectLoanRequirementRules = () => [
  body("projectType").trim().notEmpty().withMessage("Please select the project type"),
  otherIf("projectType", "projectTypeOther", "Please mention the project type"),
  body("totalProjectCost")
    .isFloat({ min: 0 })
    .withMessage("Total project cost is required and must be a non-negative number"),
  requiredDate("projectStartDate", "Project start date is required", "Enter a valid project start date"),
  requiredDate(
    "projectCompletionDate",
    "Project date of completion is required",
    "Enter a valid project date of completion"
  ),
  body("ownInvestment")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Own investment must be a non-negative number"),
];

module.exports = { projectLoanRequirementRules };
