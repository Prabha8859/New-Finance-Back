const mongoose = require("mongoose");
const { requiredFor, requiredForSelfEmployed } = require("../../../utils/employmentTypeRules");

/* =========================================================================
 * STEP 3 (part 2) — Income Details · Self Employed
 * =========================================================================
 * ONE shared block holds BOTH self-employed sub-types:
 *
 *   "Self Employed - Business"      -> business* fields
 *   "Self Employed - Professional"  -> profession + current/prior year fields
 *   both                            -> business address + transaction banks
 *
 * The `requiredFor(...)` rules below decide which ones the applicant must fill,
 * based on the submitted employmentType. That is why there is no separate file
 * for each sub-type.
 * ========================================================================= */

const businessIncomeFields = {
  businessType: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Business"),
  },
  businessTypeOther: { type: String, trim: true },
  businessName: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Business"),
  },
  gstNumber: { type: String, trim: true },
  companyPanNumber: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Business"),
  },
  natureOfBusiness: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Business"),
  },
  natureOfBusinessOther: { type: String, trim: true },
  industryType: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Business"),
  },
  industryTypeOther: { type: String, trim: true },
  subIndustry: { type: String, trim: true },
  profession: {
    type: String,
    trim: true,
    required: requiredFor("Self Employed - Professional"),
  },
  businessEstablishedDate: {
    type: Date,
    required: requiredFor("Self Employed - Business"),
  },
  transactionBankName: { type: mongoose.Schema.Types.Mixed, default: [] },
  transactionBankOther: { type: String, trim: true },
  transactionBankDisplayName: { type: String, trim: true },
  currentYearTurnover: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Professional"),
  },
  priorYearTurnover: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Professional"),
  },
  currentYearNetIncome: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Professional"),
  },
  previousYearNetIncome: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Professional"),
  },
  lastYearTurnover: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsTurnover: { type: Number, default: 0 },
  lastYearNetIncome: {
    type: Number,
    default: 0,
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsNetIncome: { type: Number, default: 0 },
  businessState: {
    type: String,
    trim: true,
    required: requiredForSelfEmployed,
  },
  businessCity: {
    type: String,
    trim: true,
    required: requiredForSelfEmployed,
  },
  businessPincode: {
    type: String,
    trim: true,
    required: requiredForSelfEmployed,
  },
  businessPincodeOther: { type: String, trim: true },
  businessPlaceStatus: {
    type: String,
    trim: true,
    required: requiredForSelfEmployed,
  },
  businessPlaceStatusOther: { type: String, trim: true },
};

/** Every field in the self-employed block. */
const SELF_EMPLOYED_FIELD_NAMES = Object.keys(businessIncomeFields);

/**
 * Professional-only fields (everything else in the block belongs to Business too).
 *
 * Note: "professionOther" is deliberately NOT listed — there is no such stored
 * field. A dashboard "Other" profession is merged into `profession` itself by
 * OTHER_FIELD_PAIRS in src/utils/normalizeLoanPayload.js, so listing it here only
 * made responses report a field that can never exist.
 */
const PROFESSIONAL_FIELD_NAMES = [
  "profession",
  "currentYearTurnover",
  "priorYearTurnover",
  "currentYearNetIncome",
  "previousYearNetIncome",
];

/** Business address fields, shared by both self-employed types. */
const BUSINESS_ADDRESS_FIELD_NAMES = [
  "businessState",
  "businessCity",
  "businessPincode",
  "businessPincodeOther",
  "businessPlaceStatus",
  "businessPlaceStatusOther",
];

/** Transaction-bank fields, shared by both self-employed types. */
const TRANSACTION_BANK_FIELD_NAMES = ["transactionBankName", "transactionBankOther"];

module.exports = {
  businessIncomeFields,
  SELF_EMPLOYED_FIELD_NAMES,
  PROFESSIONAL_FIELD_NAMES,
  BUSINESS_ADDRESS_FIELD_NAMES,
  TRANSACTION_BANK_FIELD_NAMES,
};
