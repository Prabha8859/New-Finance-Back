const { body } = require("express-validator");
const { otherIf } = require("../shared/helpers");

/* =========================================================================
 * STEP 2 — Loan Requirements · FILM FUNDING only
 * =========================================================================
 * The film is the security, so industry / languages / star cast and the two
 * money fields are mandatory.
 *
 * Two rules here are special:
 *   1. filmLanguages + starCastNames arrive as an array OR a CSV string
 *      ("Hindi,English") — both shapes are normalised to an array first.
 *   2. ownInvestmentAmount must be at least 20% of totalProjectCost, which is
 *      the rule the dashboard prints under the field ("Should be min 20% of
 *      the Project cost").
 * ========================================================================= */

/** Array, or a comma separated string, -> clean array of strings. */
const toArray = (value) => {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

/** A repeatable field: at least one value, either as an array or CSV. */
const multiSelect = (field, message) =>
  body(field).customSanitizer(toArray).isArray({ min: 1 }).withMessage(message);

/** Every entry must be a real, non-empty name. */
const nameListCheck = (message) => (values) => {
  const entries = Array.isArray(values) ? values : [];
  if (entries.length && entries.every((entry) => String(entry ?? "").trim().length > 0)) return true;
  throw new Error(message);
};

const filmFundingRequirementRules = () => [
  body("filmComesUnder").trim().notEmpty().withMessage("Please select the film's industry"),
  otherIf("filmComesUnder", "filmComesUnderOther", "Please mention the film's industry"),

  multiSelect("filmLanguages", "Select at least one film language"),
  multiSelect("starCastNames", "Add at least one main star cast name"),
  body("starCastNames").custom(nameListCheck("Star cast names cannot be empty")),

  body("totalProjectCost")
    .isFloat({ min: 1 })
    .withMessage("Total film project cost is required and must be a positive number"),

  body("ownInvestmentAmount")
    .isFloat({ min: 0 })
    .withMessage("Own investment amount is required and must be a non-negative number")
    // The dashboard states this rule itself: "Should be min 20% of the Project cost".
    .custom((value, { req }) => {
      const totalProjectCost = Number(req.body.totalProjectCost);
      if (!Number.isFinite(totalProjectCost) || totalProjectCost <= 0) return true;

      const minimum = totalProjectCost * 0.2;
      if (Number(value) < minimum) {
        throw new Error(
          `Own investment must be at least 20% of the total film project cost (₹${Math.ceil(minimum)})`
        );
      }
      return true;
    }),
];

module.exports = { filmFundingRequirementRules };
