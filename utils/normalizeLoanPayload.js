/**
 * Normalises loan-application payloads coming from the customer dashboard.
 *
 * The dashboard forms (personal / business / home loan) send slightly different
 * field names and formatting than the backend models use — this module maps both
 * shapes onto a single canonical payload so API clients can send either one.
 *
 * Canonical (backend) field names stay untouched; only aliases are rewritten.
 */

/** Fields that only the server may set — never trusted from the client. */
const SERVER_OWNED_FIELDS = ["user", "loanType", "status", "createdAt", "updatedAt", "__v", "_id"];

/** Dashboard field name -> backend field name. */
const FIELD_ALIASES = {
  monthlyNetSalary: "monthlySalary",
  salaryBankNameOther: "salaryBankOther",
  transactionBankNameOther: "transactionBankOther",
  existingBanksOther: "otherBankList",
  existingLoanTypesOther: "otherLoanList",
};

/**
 * "<field>: 'Other'" + "<field>Other: <free text>" -> "<field>: <free text>".
 * The dashboard already resolves these before submitting; this also supports
 * clients that submit the raw form state.
 */
const OTHER_FIELD_PAIRS = [
  ["pincode", "pincodeOther"],
  ["residenceStatus", "residenceStatusOther"],
  ["companyType", "companyTypeOther"],
  ["salaryBankName", "salaryBankOther"],
  ["businessType", "businessTypeOther"],
  ["natureOfBusiness", "natureOfBusinessOther"],
  ["industryType", "industryTypeOther"],
  ["profession", "professionOther"],
  ["businessPincode", "businessPincodeOther"],
  ["businessPlaceStatus", "businessPlaceStatusOther"],
  ["buyingPropertyType", "buyingPropertyTypeOther"],
  ["buyingPropertyPincode", "buyingPropertyPincodeOther"],
  ["collateralPropertyType", "collateralPropertyTypeOther"],
  ["collateralPropertyPincode", "collateralPropertyPincodeOther"],
  ["transactionBankName", "transactionBankOther"],
];

/** Dashboard sends the tenure as years (and a custom value of -1 selects it). */
const TENURE_YEAR_FIELDS = ["loanTenureYears", "loanTenureYearsCustom"];

/** Selector placeholders — never real bank names. */
const SENTINEL_BANK_VALUES = new Set(["other", "multiple transaction banks"]);

const pushUnique = (target, rawValue) => {
  if (rawValue === undefined || rawValue === null) return;

  const values = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");

  values.forEach((item) => {
    const value = String(item ?? "").trim();
    if (!value) return;
    if (!target.some((existing) => existing.toLowerCase() === value.toLowerCase())) target.push(value);
  });
};

const normalizeApplyPayload = (body) => {
  if (!body || typeof body !== "object") return body;

  // Some clients wrap the application in a `data` object — flatten it so the
  // validators and controllers always read the same shape.
  const source = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : body;
  const payload = { ...source };

  // 1. Dashboard aliases -> canonical field names.
  Object.entries(FIELD_ALIASES).forEach(([alias, canonical]) => {
    if (payload[canonical] === undefined && payload[alias] !== undefined) payload[canonical] = payload[alias];
    delete payload[alias];
  });

  // 2. Resolve "<field>: 'Other'" into its free-text counterpart.
  OTHER_FIELD_PAIRS.forEach(([field, otherField]) => {
    const value = String(payload[field] ?? "").trim();
    const otherValue = String(payload[otherField] ?? "").trim();

    if (value === "Other" && otherValue) {
      payload[field] = otherValue;
      delete payload[otherField];
    }
  });

  // 3. Tenure: the dashboard sends years and multiplies by 12 (months).
  //    `loanTenure` always means months for every product.
  const tenureYears =
    payload.loanTenureYears === -1 ? payload.loanTenureYearsCustom : payload.loanTenureYears;
  if (payload.loanTenure === undefined && tenureYears !== undefined && tenureYears !== null && tenureYears !== "") {
    const years = Number(tenureYears);
    if (Number.isFinite(years) && years > 0) payload.loanTenure = years * 12;
  }
  TENURE_YEAR_FIELDS.forEach((field) => delete payload[field]);

  // 4. The dashboard keeps the selected banks in `transactionBanks` when the
  //    selector is on "Multiple Transaction Banks".
  if (Array.isArray(payload.transactionBanks) && payload.transactionBanks.length) {
    const banks = [];
    pushUnique(banks, payload.transactionBankName);
    pushUnique(banks, payload.transactionBanks);
    payload.transactionBankName = banks.filter((bank) => !SENTINEL_BANK_VALUES.has(bank.toLowerCase()));
  }
  delete payload.transactionBanks;

  // 5. Server-owned fields are dropped instead of rejected (ignored, not trusted).
  SERVER_OWNED_FIELDS.forEach((field) => delete payload[field]);
  delete payload.data;

  return payload;
};

module.exports = { normalizeApplyPayload, SERVER_OWNED_FIELDS, FIELD_ALIASES };
