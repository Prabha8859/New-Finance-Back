const { body } = require("express-validator");
const { needsCustomBankName } = require("../../../shared/utils/transactionBanks");
const {
  BUSINESS,
  PROFESSIONAL,
  SELF_EMPLOYED,
  PAN_PATTERN,
  GST_PATTERN,
  DATE_PATTERN,
  requiredIf,
  requiredForTypes,
  otherIf,
  amountIf,
  pincodeOrOtherCheck,
} = require("./helpers");

/* =========================================================================
 * STEP 5 (part 2) — Income Details · Self Employed
 * =========================================================================
 * TWO sub-types share this one file:
 *
 *   "Self Employed - Business"      -> businessChain()      (businessName, PAN, turnover...)
 *   "Self Employed - Professional"  -> professionalChain()  (profession, current year...)
 *   both                            -> businessAddressChain() + transactionBankNameChain()
 *
 * As with the salaried file, the `.if(...)` and requiredIf/amountIf helpers make
 * each rule run only for the employment type it belongs to.
 * ========================================================================= */

/* ---- Shared by both self-employed sub-types ---- */

/** Business address, asked of both Business and Professional applicants. */
const businessAddressChain = () => [
  requiredForTypes("businessState", SELF_EMPLOYED, "Business state is required"),
  requiredForTypes("businessCity", SELF_EMPLOYED, "Business city is required"),
  body("businessPincode")
    .if(body("employmentType").isIn(SELF_EMPLOYED))
    .trim()
    .custom(pincodeOrOtherCheck("Enter a valid 6-digit business pincode")),
  otherIf("businessPincode", "businessPincodeOther", "Please mention business pincode"),
  requiredForTypes("businessPlaceStatus", SELF_EMPLOYED, "Business place status is required"),
  otherIf("businessPlaceStatus", "businessPlaceStatusOther", "Please mention business place status"),
];

/** The bank the applicant transacts with — accepts "Other" or a multi-bank list. */
const transactionBankNameChain = () => [
  body("transactionBankName")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === "") return true;

      if (typeof value === "string") {
        if (!value.trim()) throw new Error("Transaction bank name cannot be empty");
        return true;
      }

      if (Array.isArray(value)) {
        if (value.some((item) => typeof item !== "string" || !String(item).trim())) {
          throw new Error("Transaction bank name must be a string or an array of strings");
        }
        return true;
      }

      if (value && typeof value === "object") {
        if (typeof value.displayName !== "string" || !value.displayName.trim()) {
          throw new Error("Transaction bank display name is required");
        }
        if (!Array.isArray(value.banks) || value.banks.length === 0) {
          throw new Error("Transaction bank list is required");
        }
        if (value.banks.some((item) => typeof item !== "string" || !String(item).trim())) {
          throw new Error("Transaction bank list must contain only valid bank names");
        }
        return true;
      }

      throw new Error("Transaction bank name must be a string, array of strings, or bank object");
    }),
  body("transactionBankOther")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (needsCustomBankName(req.body.transactionBankName) && !String(value ?? "").trim()) {
        throw new Error("Please mention transaction bank name");
      }
      return true;
    }),
];

/* ---- Self Employed - Business ---- */

const businessChain = (config) => [
  requiredIf("businessType", BUSINESS, "Business type is required"),
  otherIf("businessType", "businessTypeOther", "Please mention business type"),
  requiredIf("businessName", BUSINESS, "Business name is required"),
  requiredIf("companyPanNumber", BUSINESS, "Company PAN number is required"),
  body("companyPanNumber")
    .if(body("employmentType").equals(BUSINESS))
    .trim()
    .matches(PAN_PATTERN)
    .withMessage("Enter a valid company PAN number"),
  ...(config.gstFormat
    ? [
        body("gstNumber")
          .if(body("employmentType").equals(BUSINESS))
          .optional({ values: "falsy" })
          .trim()
          .matches(GST_PATTERN)
          .withMessage("Enter a valid 15-character GST number"),
      ]
    : []),
  requiredIf("natureOfBusiness", BUSINESS, "Nature of business is required"),
  otherIf("natureOfBusiness", "natureOfBusinessOther", "Please mention nature of business"),
  requiredIf("industryType", BUSINESS, "Industry type is required"),
  otherIf("industryType", "industryTypeOther", "Please mention industry type"),
  body("businessEstablishedDate")
    .if(body("employmentType").equals(BUSINESS))
    .custom((value) => {
      if (!DATE_PATTERN.test(String(value ?? "").trim())) {
        throw new Error("Business establishment date is required");
      }
      return true;
    }),
  amountIf("lastYearTurnover", BUSINESS, "Last year turnover is required"),
  amountIf("lastYearNetIncome", BUSINESS, "Last year net income is required"),
];

/* ---- Self Employed - Professional ---- */

const professionalChain = () => [
  requiredIf("profession", PROFESSIONAL, "Profession is required"),
  otherIf("profession", "professionOther", "Please mention profession"),
  amountIf("currentYearTurnover", PROFESSIONAL, "Current year turnover is required"),
  amountIf("priorYearTurnover", PROFESSIONAL, "Previous year turnover is required"),
  amountIf("currentYearNetIncome", PROFESSIONAL, "Current year net income is required"),
  amountIf("previousYearNetIncome", PROFESSIONAL, "Previous year net income is required"),
];

/* ---- The whole section ---- */

const selfEmployedIncomeRules = (config) => [
  ...businessChain(config),
  ...professionalChain(),
  ...transactionBankNameChain(),
  ...businessAddressChain(),
];

module.exports = {
  selfEmployedIncomeRules,
  businessChain,
  professionalChain,
  businessAddressChain,
  transactionBankNameChain,
};
