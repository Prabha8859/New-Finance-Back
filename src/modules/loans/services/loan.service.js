const { LOAN_PRODUCTS } = require("../loanProducts");
const PersonalLoan = require("../models/personalLoan.model");
const BusinessLoan = require("../models/businessLoan.model");
const HomeLoan = require("../models/homeLoan.model");
const LoanAgainstProperty = require("../models/loanAgainstProperty.model");
const BalanceTransfer = require("../models/balanceTransfer.model");
const ProjectLoan = require("../models/projectLoan.model");
const CarLoan = require("../models/carLoan.model");
const EducationLoan = require("../models/educationLoan.model");
const CreditCard = require("../models/creditCard.model");
const {
  LOAN_FIELD_NAMES,
  EXPOSURE_FIELD_NAMES,
  MULTI_VALUE_EXPOSURE_FIELD_NAMES,
  PERSONAL_DETAILS_FIELD_NAMES,
  SERVER_MANAGED_FIELD_NAMES,
  loanRequirementFieldNames,
  incomeFieldNamesForEmploymentType,
} = require("../schema");
const {
  toBankNames,
  displayNameForBanks,
  normalizeTransactionBanks,
} = require("../../../shared/utils/transactionBanks");

/**
 * Shared loan application service.
 *
 * Every product runs the exact same flow — copy the fields that belong to the
 * product + employment type, normalise them, save, and trim the response — so
 * the four product controllers are now three lines each.
 */
const MODELS = {
  personal: PersonalLoan,
  business: BusinessLoan,
  home: HomeLoan,
  lap: LoanAgainstProperty,
  balanceTransfer: BalanceTransfer,
  projectLoan: ProjectLoan,
  carLoan: CarLoan,
  educationLoan: EducationLoan,
  creditCard: CreditCard,
};

/** Fields a client may send for this product + employment type. */
const dataFieldNames = (config, employmentType) => [
  "employmentType",
  ...LOAN_FIELD_NAMES,
  ...(config.loanRequirements ? loanRequirementFieldNames[config.loanRequirements] : []),
  ...incomeFieldNamesForEmploymentType(employmentType),
  ...EXPOSURE_FIELD_NAMES,
  ...PERSONAL_DETAILS_FIELD_NAMES,
];

/** Fields a response may contain (client fields + the server-managed ones). */
const responseFieldNames = (config, employmentType) => [
  ...dataFieldNames(config, employmentType),
  ...SERVER_MANAGED_FIELD_NAMES,
];

const employmentTypeFor = (config, source) =>
  String(source.employmentType ?? config.employmentTypeDefault ?? "").trim();

/** Some clients wrap the application in a `data` object. */
const unwrap = (body) =>
  body && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : body || {};

const supportsTransactionBanks = (employmentType) =>
  incomeFieldNamesForEmploymentType(employmentType).includes("transactionBankName");

/** Multi-select fields accept a single value, a CSV, or an array. */
const normalizeMultiValueFields = (data) => {
  MULTI_VALUE_EXPOSURE_FIELD_NAMES.forEach((field) => {
    const value = data[field];
    if (value === undefined) return;
    if (typeof value === "string") {
      data[field] = value.split(",").map((item) => item.trim()).filter(Boolean);
      return;
    }
    data[field] = Array.isArray(value) ? value : [value];
  });
};

/**
 * Request body -> document ready for Model.create().
 * Server-owned values always come from the auth token / product, never the body.
 */
const buildLoanDocument = (productKey, body, userId) => {
  const config = LOAN_PRODUCTS[productKey];
  const source = unwrap(body);
  const employmentType = employmentTypeFor(config, source);

  const data = { user: userId, loanType: config.loanType };

  dataFieldNames(config, employmentType).forEach((field) => {
    if (source[field] !== undefined) data[field] = source[field];
  });

  data.user = userId;
  data.loanType = config.loanType;

  // Trim every string so stored values are clean whatever the client sends.
  Object.keys(data).forEach((field) => {
    if (typeof data[field] === "string") data[field] = data[field].trim();
  });

  normalizeMultiValueFields(data);

  // The dashboard posts these dates as dd/mm/yyyy.
  ["businessEstablishedDate", "projectStartDate", "projectCompletionDate"].forEach((field) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(data[field] || ""))) {
      const [day, month, year] = data[field].split("/");
      data[field] = `${year}-${month}-${day}`;
    }
  });

  const hasBankSelection =
    supportsTransactionBanks(employmentType) &&
    (data.transactionBankName !== undefined || Boolean(data.transactionBankOther));

  if (hasBankSelection) {
    data.transactionBankName = normalizeTransactionBanks(data.transactionBankName, data.transactionBankOther);
  }
  delete data.transactionBankDisplayName;

  return data;
};

/** Keeps only the fields that belong to the product's submitted employment type. */
const sanitizeLoanResponse = (productKey, record) => {
  if (!record || typeof record !== "object") return record;
  if (Array.isArray(record)) return record.map((item) => sanitizeLoanResponse(productKey, item));

  const config = LOAN_PRODUCTS[productKey];
  const data = typeof record.toObject === "function" ? record.toObject() : { ...record };
  const employmentType = employmentTypeFor(config, data);
  const allowed = new Set(responseFieldNames(config, employmentType));

  Object.keys(data).forEach((field) => {
    if (!allowed.has(field)) delete data[field];
  });

  if (config.normalizeBankOnResponse && data.transactionBankName !== undefined && data.transactionBankName !== null) {
    const banks = toBankNames(data.transactionBankName);
    const storedDisplayName = data.transactionBankDisplayName || data.transactionBankName.displayName;

    data.transactionBankName = {
      displayName:
        storedDisplayName && String(storedDisplayName).trim()
          ? String(storedDisplayName).trim()
          : displayNameForBanks(banks),
      banks,
    };
  }

  delete data.transactionBankDisplayName;
  return data;
};

/** POST /apply + GET /applications for one product. */
const createLoanController = (productKey) => {
  const Model = MODELS[productKey];

  return {
    apply: async (req, res, next) => {
      try {
        const application = await Model.create(buildLoanDocument(productKey, req.body, req.user.id));
        res.status(201).json({ success: true, data: sanitizeLoanResponse(productKey, application) });
      } catch (error) {
        if (error.name === "ValidationError") {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: Object.values(error.errors).map((item) => item.message),
          });
        }
        next(error);
      }
    },

    list: async (req, res, next) => {
      try {
        const applications = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({
          success: true,
          data: applications.map((application) => sanitizeLoanResponse(productKey, application)),
        });
      } catch (error) {
        next(error);
      }
    },
  };
};

module.exports = { createLoanController, buildLoanDocument, sanitizeLoanResponse };
