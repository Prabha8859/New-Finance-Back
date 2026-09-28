/**
 * Generates an importable Postman collection + environment for ALL loan products.
 *
 * The apply bodies are built FROM the schema field-name lists, and the script
 * verifies that every field of every product (+ employment type) is present —
 * so the collection can never miss a field.
 *
 * Usage:  node scripts/generate-postman-collection.js
 * Output: postman/Indexia-Loans.postman_collection.json
 *         postman/Indexia-Loans.postman_environment.json
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { LOAN_PRODUCTS } = require("../src/modules/loans/loanProducts");
const schema = require("../src/modules/loans/schema");

const BASE_URL = process.env.POSTMAN_BASE_URL || "http://localhost:5000";
const OUT_DIR = path.join(__dirname, "..", "postman");

/* ------------------------------------------------------------------ *
 * Sample values per field (canonical payloads used by the e2e tests) *
 * ------------------------------------------------------------------ */
const personalDetails = {
  fullName: "Rahul Sharma",
  mobile: "9876543210",
  email: "rahul@example.com",
  dob: "1992-06-15",
  panNumber: "ABCDE1234F",
  state: "Maharashtra",
  city: "Pune",
  pincode: "411001",
  residenceStatus: "Owned",
};

const salariedIncome = {
  companyName: "ABC Corp",
  companyType: "Private Limited",
  companyTypeOther: "",
  monthlySalary: 75000,
  salaryReceivedAs: "Bank Transfer",
  salaryReceivedAsOther: "",
  salaryBankName: "HDFC Bank",
  salaryBankOther: "",
};

const businessIncome = {
  businessType: "Proprietorship",
  businessTypeOther: "",
  businessName: "Aarav Traders",
  gstNumber: "",
  companyPanNumber: "ABCDE1234F",
  natureOfBusiness: "Retail",
  natureOfBusinessOther: "",
  industryType: "Trading",
  industryTypeOther: "",
  subIndustry: "",
  businessEstablishedDate: "2018-05-12",
  lastYearTurnover: 2500000,
  last2YearsTurnover: 2300000,
  lastYearNetIncome: 350000,
  last2YearsNetIncome: 300000,
  businessState: "Maharashtra",
  businessCity: "Pune",
  businessPincode: "411001",
  businessPincodeOther: "",
  businessPlaceStatus: "Owned",
  businessPlaceStatusOther: "",
  transactionBankOther: "",
};

const professionalIncome = {
  profession: "Doctor",
  professionOther: "",
  currentYearTurnover: 500000,
  priorYearTurnover: 450000,
  currentYearNetIncome: 70000,
  previousYearNetIncome: 65000,
  businessState: "Maharashtra",
  businessCity: "Pune",
  businessPincode: "411001",
  businessPincodeOther: "",
  businessPlaceStatus: "Owned",
  businessPlaceStatusOther: "",
  transactionBankOther: "",
};

const transactionBanks = {
  transactionBankName: "Multiple Transaction Banks",
  transactionBanks: ["HDFC Bank", "State Bank of India", "ICICI Bank"],
};

/** Product-specific requirement samples (schema field -> sample value). */
const requirementSamples = {
  buyingProperty: {
    buyingPropertyType: "Villa",
    buyingPropertyTypeOther: "",
    buyingPropertyAge: 5,
    buyingPropertyState: "Maharashtra",
    buyingPropertyCity: "Pune",
    buyingPropertyPincode: "411001",
    buyingPropertyPincodeOther: "",
  },
  collateralProperty: {
    collateralPropertyType: "Residential Plot",
    collateralPropertyTypeOther: "",
    collateralPropertyMarketValue: 6000000,
    collateralPropertyAge: 10,
    collateralPropertyState: "Maharashtra",
    collateralPropertyCity: "Pune",
    collateralPropertyPincode: "411001",
    collateralPropertyPincodeOther: "",
  },
  balanceTransfer: {
    balanceTransferType: "Home loan",
    balanceTransferTypeOther: "",
    currentPropertyValue: 5000000,
    topUpAmount: 200000,
  },
  projectLoan: {
    projectType: "Construction Project",
    projectTypeOther: "",
    totalProjectCost: 10000000,
    projectStartDate: "2026-01-15",
    projectCompletionDate: "2028-06-30",
    ownInvestment: 2000000,
  },
  carLoan: {
    vehicleType: "SUV",
    vehicleTypeOther: "",
    transmissionType: "Automatic",
    transmissionTypeOther: "",
    manufacturer: "Hyundai",
    model: "Creta",
    vehiclePurchaseType: "New Vehicle",
    vehiclePurchaseTypeOther: "",
  },
  educationLoan: {
    educationCountry: "Canada",
    educationCountryOther: "",
    fieldOfStudy: "Computer Science / IT",
    fieldOfStudyOther: "",
    courseName: "B.Tech Computer Science",
    university: "University of Toronto",
    instituteName: "Faculty of Applied Science",
    enrollmentStatus: "Admission Confirmed",
    enrollmentStatusOther: "",
    courseDuration: 4,
    educationCost: 45,
  },
  creditCard: {
    hasActiveCard: "Yes",
    applyForBank: "HDFC",
    applyForBankOther: "",
  },
};

const requirementOtherSamples = {
  buyingProperty: {},
  collateralProperty: {},
  balanceTransfer: {},
  projectLoan: {},
  carLoan: {
    vehicleTypeOther: "Tractor",
    transmissionTypeOther: "CVT",
    vehiclePurchaseTypeOther: "Lease",
  },
  educationLoan: {
    educationCountryOther: "Italy",
    fieldOfStudyOther: "Design",
    enrollmentStatusOther: "Offer Letter Received",
  },
  creditCard: {
    applyForBankOther: "IDFC First",
  },
};

/* ------------------------------------------------------------------ *
 * Which fields belong to which employment type (same logic as service) *
 * ------------------------------------------------------------------ */
const incomeFieldsFor = (employmentType) => {
  switch (employmentType) {
    case "Salaried":
      return { ...salariedIncome };
    case "Self Employed - Business":
      return { ...businessIncome, ...transactionBanks };
    case "Self Employed - Professional":
      return { ...professionalIncome, ...transactionBanks };
    default:
      return {};
  }
};

/** Build one apply body for a product + employment type. */
const buildApplyBody = (config, employmentType) => {
  const body = {};
  if (config.loanAmountRequired !== false) {
    body.loanAmount = config.loanAmountMin === 1 ? 1000000 : config.loanAmountMin * 10;
  }
  if (config.loanTenureRequired !== false) {
    body.loanTenure = config.loanTenureMin < 12 ? 60 : config.loanTenureMin * 12;
  }

  if (config.employmentTypeRequired) body.employmentType = employmentType;

  Object.assign(body, requirementSamples[config.loanRequirements] || {});
  Object.assign(body, incomeFieldsFor(employmentType));
  Object.assign(body, personalDetails);

  // LAP requires exposure totals.
  if (config.exposureRequired) {
    body.existingEMI = 0;
    body.existingLoanAmount = 0;
  }

  return body;
};

/** "Other"-variant body: switch requirement selectors to Other + free text. */
const buildOtherVariantBody = (config, employmentType) => {
  const body = buildApplyBody(config, employmentType);
  const others = requirementOtherSamples[config.loanRequirements] || {};
  Object.entries(others).forEach(([field, value]) => {
    if (field.endsWith("Other")) {
      const selector = field.replace(/Other$/, "");
      if (body[selector] !== undefined) body[selector] = "Other";
    }
    body[field] = value;
  });
  return body;
};

/* ------------------------------------------------------------------ *
 * Postman item helpers                                               *
 * ------------------------------------------------------------------ */
const requestItem = (name, method, urlPath, bodyObj, description) => ({
  name,
  request: {
    method,
    header: [
      { key: "Content-Type", value: "application/json" },
      { key: "Authorization", value: "Bearer {{userToken}}" },
    ],
    ...(bodyObj
      ? {
          body: {
            mode: "raw",
            raw: JSON.stringify(bodyObj, null, 2),
            options: { raw: { language: "json" } },
          },
        }
      : {}),
    url: {
      raw: `{{baseUrl}}${urlPath}`,
      host: ["{{baseUrl}}"],
      path: urlPath.replace(/^\//, "").split("/"),
    },
    description,
  },
});

const adminRequest = (name, urlPath, description) => ({
  name,
  request: {
    method: "GET",
    header: [{ key: "Authorization", value: "Bearer {{adminToken}}" }],
    url: {
      raw: `{{baseUrl}}${urlPath}`,
      host: ["{{baseUrl}}"],
      path: urlPath.replace(/^\//, "").split("/"),
    },
    description,
  },
});

/* ------------------------------------------------------------------ *
 * Build the collection                                               *
 * ------------------------------------------------------------------ */
const productFolders = [];
const coverage = [];

Object.values(LOAN_PRODUCTS).forEach((config) => {
  const key = config.product;
  const folder = { name: config.loanType, item: [] };

  // One apply example per allowed employment type (all three for most products).
  config.employmentTypes.forEach((employmentType) => {
    const suffix = employmentType.replace("Self Employed - ", "Self Employed ");
    folder.item.push(
      requestItem(
        `Apply — ${suffix}`,
        "POST",
        `${config.route}/apply`,
        buildApplyBody(config, employmentType),
        `Apply for ${config.loanType} as ${employmentType}.`
      )
    );

    // Field coverage check: every expected field present in the body?
    // (transactionBankDisplayName is excluded — the server deletes it on save.)
    const expected = [
      ...(config.loanAmountRequired !== false ? ["loanAmount"] : []),
      ...(config.loanTenureRequired !== false ? ["loanTenure"] : []),
      ...(schema.loanRequirementFieldNames[config.loanRequirements] || []),
      ...schema.incomeFieldNamesForEmploymentType(employmentType),
      ...schema.PERSONAL_DETAILS_FIELD_NAMES,
    ].filter((field) => field !== "transactionBankDisplayName");
    const body = buildApplyBody(config, employmentType);
    const missing = expected.filter((field) => body[field] === undefined);
    coverage.push({
      product: config.loanType,
      employmentType,
      fields: expected.length,
      missing,
    });
  });

  // "Other" variant (proves the Other -> free-text flow).
  if (config.loanRequirements && Object.keys(requirementOtherSamples[config.loanRequirements] || {}).length) {
    folder.item.push(
      requestItem(
        "Apply — Other type (Other + free text)",
        "POST",
        `${config.route}/apply`,
        buildOtherVariantBody(config, config.employmentTypes[0]),
        'Selects "Other" in the requirement dropdown and sends the free-text partner field.'
      )
    );
  }

  // Multi-bank variant for self-employed products.
  if (config.employmentTypes.length > 1) {
    const multiBankBody = buildApplyBody(config, config.employmentTypes[0]);
    folder.item.push(
      requestItem(
        "Apply — Multiple transaction banks (object form)",
        "POST",
        `${config.route}/apply`,
        {
          ...multiBankBody,
          transactionBankName: {
            displayName: "Multiple Transaction Banks",
            banks: ["HDFC Bank", "State Bank of India", "ICICI Bank"],
          },
        },
        "Canonical multi-bank object form — same result as transactionBanks array."
      )
    );
  }

  folder.item.push(
    requestItem(
      "My Applications (list)",
      "GET",
      `${config.route}/applications`,
      null,
      `All ${config.loanType} applications of the logged-in user.`
    )
  );

  folder.item.push(adminRequest(`Admin — All Applications`, `/api/admin/${adminSlug(config)}`, `Admin list for ${config.loanType}.`));

  productFolders.push(folder);
});

/** Admin URL slug per product route. */
function adminSlug(config) {
  const map = {
    "/api/personal-loan": "personal-loans",
    "/api/business-loan": "business-loans",
    "/api/home-loan": "home-loans",
    "/api/loan-against-property": "loan-against-properties",
    "/api/balance-transfer": "balance-transfers",
    "/api/project-loan": "project-loans",
    "/api/car-loan": "car-loans",
    "/api/education-loan": "education-loans",
    "/api/credit-card": "credit-cards",
  };
  return map[config.route];
}

const collection = {
  info: {
    name: "Indexia Finance — Loans API",
    _postman_id: "indexia-loans-api-001",
    description:
      "All loan products (Personal, Business, Home, LAP, Balance Transfer, Project Loan, Car Loan) with apply/list + admin endpoints. Set baseUrl, then run the Auth folder first — it saves {{userToken}} / {{adminToken}} automatically.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: [
    {
      name: "Auth — User (run first)",
      item: [
        {
          name: "Register & Send OTP",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify(
                { name: "Rahul Sharma", mobile: "9876543210", email: "rahul@example.com" },
                null,
                2
              ),
              options: { raw: { language: "json" } },
            },
            url: { raw: "{{baseUrl}}/api/auth/register", host: ["{{baseUrl}}"], path: ["api", "auth", "register"] },
            description: "Sends OTP. With the dev STATIC_OTP the code is always 123456.",
          },
          event: [
            {
              listen: "test",
              script: {
                exec: ["// nothing to save here; OTP is static in dev"],
                type: "text/javascript",
              },
            },
          ],
        },
        {
          name: "Verify OTP (saves userToken)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ mobile: "9876543210", otp: "123456" }, null, 2),
              options: { raw: { language: "json" } },
            },
            url: { raw: "{{baseUrl}}/api/auth/verify-otp", host: ["{{baseUrl}}"], path: ["api", "auth", "verify-otp"] },
          },
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const data = pm.response.json();",
                  "if (data.token) pm.collectionVariables.set('userToken', data.token);",
                  'pm.test("verified", () => pm.expect(data.success).to.eql(true));',
                ],
                type: "text/javascript",
              },
            },
          ],
        },
      ],
    },
    {
      name: "Auth — Admin (run first)",
      item: [
        {
          name: "Admin Login (saves adminToken)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({ email: "{{adminEmail}}", password: "{{adminPassword}}" }, null, 2),
              options: { raw: { language: "json" } },
            },
            url: { raw: "{{baseUrl}}/api/admin/auth/login", host: ["{{baseUrl}}"], path: ["api", "admin", "auth", "login"] },
          },
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "const data = pm.response.json();",
                  "if (data.token) pm.collectionVariables.set('adminToken', data.token);",
                  'pm.test("admin login", () => pm.expect(data.success).to.eql(true));',
                ],
                type: "text/javascript",
              },
            },
          ],
        },
      ],
    },
    ...productFolders,
  ],
  variable: [
    { key: "userToken", value: "" },
    { key: "adminToken", value: "" },
  ],
};

const environment = {
  name: "Indexia — Local (5000)",
  values: [
    { key: "baseUrl", value: BASE_URL, enabled: true },
    { key: "adminEmail", value: "admin@indexia.com", enabled: true },
    { key: "adminPassword", value: "Admin@123", enabled: true },
  ],
};

/* ------------------------------------------------------------------ *
 * Write files + print coverage report                                *
 * ------------------------------------------------------------------ */
fs.mkdirSync(OUT_DIR, { recursive: true });
const collectionPath = path.join(OUT_DIR, "Indexia-Loans.postman_collection.json");
const environmentPath = path.join(OUT_DIR, "Indexia-Loans.postman_environment.json");
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2));

console.log("=== POSTMAN COLLECTION GENERATED ===");
console.log("Collection:  " + path.relative(process.cwd(), collectionPath));
console.log("Environment: " + path.relative(process.cwd(), environmentPath));

console.log("\n=== FIELD COVERAGE (schema -> body) ===");
let missingTotal = 0;
coverage.forEach((row) => {
  const ok = row.missing.length === 0;
  if (!ok) missingTotal += row.missing.length;
  console.log(
    `${ok ? "OK  " : "MISS"} | ${row.product} | ${row.employmentType} | fields: ${row.fields}` +
      (ok ? "" : ` | missing: ${row.missing.join(", ")}`)
  );
});
console.log(`\n${coverage.length} product/employment combos checked, ${missingTotal} missing fields total.`);
process.exit(missingTotal ? 1 : 0);
