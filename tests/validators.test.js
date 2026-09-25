const { registerValidator } = require("../middleware/validators/authValidators");
const { applyValidator } = require("../middleware/validators/personalLoanValidators");
const { normalizeTransactionBankNames, sanitizeBusinessLoanResponse } = require("../controllers/businessLoan.controller");
const homeLoanController = require("../controllers/homeLoan.controller");
const personalLoanController = require("../controllers/personalLoan.controller");
const { normalizeApplyPayload } = require("../utils/normalizeLoanPayload");
const { appendUniqueValue } = require("../services/admin/master.service");
const PersonalLoan = require("../models/PersonalLoan");
const LoanAgainstProperty = require("../models/LoanAgainstProperty");
const LoanAgainstPropertyController = require("../controllers/loanAgainstProperty.controller");
const BusinessLoan = require("../models/BusinessLoan");
const HomeLoan = require("../models/HomeLoan");
const { businessIncomeFields } = require("../models/schemas/loanSections");
const businessApplicationController = require("../controllers/admin/application.controller");

jest.mock("../models/BusinessLoan", () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

/** Runs an express-validator chain (+ the trailing handleValidationErrors) against a fake req. */
const runChain = (chain, body) => {
  const req = { body };
  return new Promise((resolve) => {
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ passed: false, statusCode: this.statusCode, body: payload });
        return this;
      },
    };

    let idx = 0;
    const next = async () => {
      if (idx >= chain.length) {
        resolve({ passed: true });
        return;
      }
      await chain[idx++](req, res, next);
    };
    next();
  });
};

describe("authValidators.registerValidator", () => {
  it("passes with a valid payload", async () => {
    const result = await runChain(registerValidator, {
      name: "Test User",
      mobile: "9876543210",
      email: "test@example.com",
    });
    expect(result.passed).toBe(true);
  });

  it("rejects a mobile number that isn't 10 digits", async () => {
    const result = await runChain(registerValidator, {
      name: "Test User",
      mobile: "12345",
      email: "test@example.com",
    });
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(400);
  });

  it("rejects a malformed email", async () => {
    const result = await runChain(registerValidator, {
      name: "Test User",
      mobile: "9876543210",
      email: "not-an-email",
    });
    expect(result.passed).toBe(false);
  });
});

describe("personalLoanValidators.applyValidator", () => {
  const validPayload = {
    loanAmount: 500000,
    loanTenure: 24,
    fullName: "Test User",
    mobile: "9876543210",
  };

  it("passes with the minimum required fields", async () => {
    const result = await runChain(applyValidator, validPayload);
    expect(result.passed).toBe(true);
  });

  it("rejects a client-supplied status field (mass-assignment guard)", async () => {
    const result = await runChain(applyValidator, { ...validPayload, status: "Approved" });
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(400);
  });

  it("rejects a non-numeric loan amount", async () => {
    const result = await runChain(applyValidator, { ...validPayload, loanAmount: "abc" });
    expect(result.passed).toBe(false);
  });
});

describe("homeLoanModel.professionalPayload", () => {
  it("does not require business-only fields for professional employment type", () => {
    const doc = new HomeLoan({
      user: "64f000000000000000000001",
      loanType: "Home Loan",
      loanAmount: 1000000,
      loanTenure: 5,
      buyingPropertyType: "Apartment",
      buyingPropertyAge: 3,
      buyingPropertyState: "Maharashtra",
      buyingPropertyCity: "Mumbai",
      buyingPropertyPincode: "400001",
      employmentType: "Self Employed - Professional",
      profession: "Doctor",
      currentYearTurnover: 500000,
      priorYearTurnover: 450000,
      currentYearNetIncome: 70000,
      previousYearNetIncome: 65000,
      businessState: "Maharashtra",
      businessCity: "Mumbai",
      businessPincode: "400001",
      businessPlaceStatus: "Owned",
      transactionBankName: { displayName: "HDFC", banks: ["HDFC"] },
      fullName: "Bijendra99",
      mobile: "8691889999",
      email: "vinimalik99@gmail.com",
      dob: "1995-05-15",
      panNumber: "ABCDE1234F",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      residenceStatus: "Owned",
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
  });

  it("does not require business-only fields for salaried employment type", () => {
    const doc = new HomeLoan({
      user: "64f000000000000000000001",
      loanType: "Home Loan",
      loanAmount: 1000000,
      loanTenure: 5,
      buyingPropertyType: "Apartment",
      buyingPropertyAge: 3,
      buyingPropertyState: "Maharashtra",
      buyingPropertyCity: "Mumbai",
      buyingPropertyPincode: "400001",
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlySalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC",
      fullName: "John Doe",
      mobile: "9876543210",
      email: "john@example.com",
      dob: "1995-05-15",
      panNumber: "ABCDE1234F",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      residenceStatus: "Owned",
    });

    const error = doc.validateSync();
    expect(error).toBeUndefined();
  });

  it("keeps business address requirements scoped to both self-employed employment types", () => {
    expect(businessIncomeFields.businessState.required.call({ employmentType: "Salaried" })).toBe(false);
    expect(businessIncomeFields.businessState.required.call({ employmentType: "Self Employed - Business" })).toBe(true);
    expect(businessIncomeFields.businessState.required.call({ employmentType: "Self Employed - Professional" })).toBe(true);
    expect(businessIncomeFields.businessPincode.required.call({ employmentType: "Salaried" })).toBe(false);
    expect(businessIncomeFields.businessPincode.required.call({ employmentType: "Self Employed - Business" })).toBe(true);
    expect(businessIncomeFields.businessPincode.required.call({ employmentType: "Self Employed - Professional" })).toBe(true);
  });
});

describe("businessLoanController.normalizeTransactionBankNames", () => {
  it("keeps selected banks and appends a custom other bank name", () => {
    const result = normalizeTransactionBankNames(["HDFC", "SBI"], "Yes Bank");
    expect(result).toEqual({
      displayName: "Multiple Transaction Banks",
      banks: ["HDFC", "SBI", "Yes Bank"],
    });
  });

  it("removes sentinel values and keeps only actual bank names", () => {
    const result = normalizeTransactionBankNames(["HDFC", "Multiple Transaction Banks"], "Yes Bank");
    expect(result).toEqual({
      displayName: "Multiple Transaction Banks",
      banks: ["HDFC", "Yes Bank"],
    });
  });
});

describe("businessLoanController.sanitizeBusinessLoanResponse", () => {
  it("removes professional-only fields for a business employment type", () => {
    const result = sanitizeBusinessLoanResponse({
      employmentType: "Self Employed - Business",
      currentYearTurnover: 0,
      priorYearTurnover: 0,
      currentYearNetIncome: 0,
      previousYearNetIncome: 0,
      lastYearTurnover: 2500000,
      lastYearNetIncome: 350000,
      transactionBankName: ["HDFC"],
    });

    expect(result).not.toHaveProperty("currentYearTurnover");
    expect(result).not.toHaveProperty("priorYearTurnover");
    expect(result).not.toHaveProperty("currentYearNetIncome");
    expect(result).not.toHaveProperty("previousYearNetIncome");
    expect(result).toHaveProperty("lastYearTurnover", 2500000);
    expect(result).toHaveProperty("transactionBankName");
    expect(result.transactionBankName).toEqual({
      displayName: "HDFC",
      banks: ["HDFC"],
    });
  });

  it("removes business-only fields for a professional employment type", () => {
    const result = sanitizeBusinessLoanResponse({
      employmentType: "Self Employed - Professional",
      profession: "Doctor",
      currentYearTurnover: 500000,
      priorYearTurnover: 450000,
      currentYearNetIncome: 70000,
      previousYearNetIncome: 65000,
      businessType: "Proprietorship",
      businessName: "ABC Pvt Ltd",
      lastYearTurnover: 2500000,
      lastYearNetIncome: 350000,
    });

    expect(result).not.toHaveProperty("businessType");
    expect(result).not.toHaveProperty("businessName");
    expect(result).not.toHaveProperty("lastYearTurnover");
    expect(result).not.toHaveProperty("lastYearNetIncome");
    expect(result).toHaveProperty("profession", "Doctor");
    expect(result).toHaveProperty("currentYearTurnover", 500000);
  });
});

describe("adminApplicationController.listBusinessLoans", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("removes professional-only fields before returning business loan records", async () => {
    BusinessLoan.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          employmentType: "Self Employed - Business",
          currentYearTurnover: 0,
          priorYearTurnover: 0,
          currentYearNetIncome: 0,
          previousYearNetIncome: 0,
          lastYearTurnover: 2500000,
          lastYearNetIncome: 350000,
          transactionBankName: ["HDFC"],
        },
      ]),
    });

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await businessApplicationController.listBusinessLoans(req, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0]).not.toHaveProperty("currentYearTurnover");
    expect(payload.data[0]).not.toHaveProperty("priorYearTurnover");
    expect(payload.data[0]).not.toHaveProperty("currentYearNetIncome");
    expect(payload.data[0]).not.toHaveProperty("previousYearNetIncome");
    expect(payload.data[0]).toHaveProperty("lastYearTurnover", 2500000);
  });
});

describe("masterService.appendUniqueValue", () => {
  it("adds a custom value without duplicating case-insensitive matches", () => {
    const values = ["HDFC Bank", "SBI"];
    const result = appendUniqueValue(values, "hdfc bank");
    expect(result).toEqual(["HDFC Bank", "SBI"]);
  });

  it("appends a new value when it is unique", () => {
    const values = ["HDFC Bank", "SBI"];
    const result = appendUniqueValue(values, "Axis Bank");
    expect(result).toEqual(["HDFC Bank", "SBI", "Axis Bank"]);
  });
});

describe("homeLoanController.apply (Self Employed - Business)", () => {
  const businessPayload = {
    loanAmount: 1800000,
    loanTenure: 15,
    buyingPropertyType: "Villa",
    buyingPropertyAge: 5,
    buyingPropertyState: "Maharashtra",
    buyingPropertyCity: "Pune",
    buyingPropertyPincode: "411001",
    employmentType: "Self Employed - Business",
    businessType: "Proprietorship",
    businessName: "Aarav Traders",
    companyPanNumber: "ABCDE1234F",
    natureOfBusiness: "Retail",
    industryType: "Trading",
    businessEstablishedDate: "2018-05-12",
    transactionBankName: { displayName: "Multiple Transaction Banks", banks: ["HDFC", "SBI", "ICICI"] },
    lastYearTurnover: 2500000,
    last2YearsTurnover: 2300000,
    lastYearNetIncome: 350000,
    last2YearsNetIncome: 300000,
    businessState: "Maharashtra",
    businessCity: "Pune",
    businessPincode: "411001",
    businessPlaceStatus: "Owned",
    fullName: "Rohit Sharma",
    mobile: "9876543210",
    email: "rohit@example.com",
    dob: "1992-06-15",
    panNumber: "ABCDE1234F",
    state: "Maharashtra",
    city: "Pune",
    pincode: "411001",
    residenceStatus: "Owned",
  };

  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps business address fields when creating a business home-loan application", async () => {
    const createSpy = jest.spyOn(HomeLoan, "create").mockResolvedValue({ toObject: () => ({ ...businessPayload }) });

    await homeLoanController.apply({ body: businessPayload, user: { id: "64f000000000000000000001" } }, res, jest.fn());

    expect(res.statusCode).toBe(201);
    expect(createSpy).toHaveBeenCalledTimes(1);
    const saved = createSpy.mock.calls[0][0];
    expect(saved.businessState).toBe("Maharashtra");
    expect(saved.businessCity).toBe("Pune");
    expect(saved.businessPincode).toBe("411001");
    expect(saved.businessPlaceStatus).toBe("Owned");
    expect(saved.currentYearTurnover).toBeUndefined();
    expect(saved.transactionBankName).toEqual({
      displayName: "Multiple Transaction Banks",
      banks: ["HDFC", "SBI", "ICICI"],
    });
  });

  it("strips professional-only fields from the business response", async () => {
    jest.spyOn(HomeLoan, "create").mockResolvedValue({
      toObject: () => ({
        ...businessPayload,
        profession: "Doctor",
        currentYearTurnover: 100,
        priorYearTurnover: 90,
        currentYearNetIncome: 10,
        previousYearNetIncome: 9,
      }),
    });

    await homeLoanController.apply({ body: businessPayload, user: { id: "64f000000000000000000001" } }, res, jest.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toHaveProperty("profession");
    expect(res.body.data).not.toHaveProperty("currentYearTurnover");
    expect(res.body.data).toHaveProperty("businessState", "Maharashtra");
  });
});

describe("homeLoanValidators.applyValidator (Self Employed - Business)", () => {
  const { applyValidator: homeApplyValidator } = require("../middleware/validators/homeLoanValidators");

  const businessPayload = {
    loanAmount: 1800000,
    loanTenure: 15,
    buyingPropertyType: "Villa",
    buyingPropertyAge: 5,
    buyingPropertyState: "Maharashtra",
    buyingPropertyCity: "Pune",
    buyingPropertyPincode: "411001",
    employmentType: "Self Employed - Business",
    businessType: "Proprietorship",
    businessName: "Aarav Traders",
    companyPanNumber: "ABCDE1234F",
    natureOfBusiness: "Retail",
    industryType: "Trading",
    businessEstablishedDate: "2018-05-12",
    transactionBankName: { displayName: "Multiple Transaction Banks", banks: ["HDFC", "SBI", "ICICI"] },
    lastYearTurnover: 2500000,
    lastYearNetIncome: 350000,
    businessState: "Maharashtra",
    businessCity: "Pune",
    businessPincode: "411001",
    businessPlaceStatus: "Owned",
    fullName: "Rohit Sharma",
    mobile: "9876543210",
    email: "rohit@example.com",
    dob: "1992-06-15",
    panNumber: "ABCDE1234F",
    state: "Maharashtra",
    city: "Pune",
    pincode: "411001",
    residenceStatus: "Owned",
  };

  it("passes the full business payload", async () => {
    const result = await runChain(homeApplyValidator, businessPayload);
    expect(result.passed).toBe(true);
  });

  it("rejects an invalid company PAN number", async () => {
    const result = await runChain(homeApplyValidator, { ...businessPayload, companyPanNumber: "invalid" });
    expect(result.passed).toBe(false);
  });
});

/** Payload exactly as the deployed dashboard builds it (business/home quick forms). */
const dashboardBusinessPayload = (overrides = {}) => normalizeApplyPayload({
  loanAmount: 1000000,
  loanTenureYears: 15,
  employmentType: "Self Employed - Business",
  businessType: "Proprietorship",
  businessName: "Aarav Traders",
  companyPanNumber: "ABCDE1234F",
  natureOfBusiness: "Retail",
  industryType: "Trading",
  businessEstablishedDate: "2018-05-12T00:00:00.000Z",
  transactionBankName: "Multiple Transaction Banks",
  transactionBanks: ["HDFC", "SBI"],
  lastYearTurnover: 2500000,
  lastYearNetIncome: 350000,
  businessState: "Maharashtra",
  businessCity: "Pune",
  businessPincode: "411001",
  businessPlaceStatus: "Owned",
  fullName: "Rohit Sharma",
  mobile: "9876543210",
  email: "rohit@example.com",
  dob: "1992-06-15",
  panNumber: "ABCDE1234F",
  state: "Maharashtra",
  city: "Pune",
  pincode: "411001",
  residenceStatus: "Owned",
  ...overrides,
});

describe("normalizeLoanPayload.normalizeApplyPayload", () => {
  it("maps dashboard field names onto the canonical ones", () => {
    const payload = normalizeApplyPayload({
      monthlyNetSalary: 75000,
      salaryBankName: "HDFC Bank",
      existingBanks: ["HDFC"],
      existingBanksOther: ["Yes Bank"],
      existingLoanTypes: ["Personal Loan"],
      existingLoanTypesOther: [],
    });

    expect(payload.monthlySalary).toBe(75000);
    expect(payload.monthlyNetSalary).toBeUndefined();
    expect(payload.otherBankList).toEqual(["Yes Bank"]);
    expect(payload.existingBanksOther).toBeUndefined();
  });

  it("resolves '<field>: Other' into its free-text value", () => {
    const payload = normalizeApplyPayload({
      companyType: "Other",
      companyTypeOther: "Partnership",
      businessPlaceStatus: "Other",
      businessPlaceStatusOther: "Rented",
    });

    expect(payload.companyType).toBe("Partnership");
    expect(payload.companyTypeOther).toBeUndefined();
    expect(payload.businessPlaceStatus).toBe("Rented");
  });

  it("converts dashboard tenure (years) into months", () => {
    expect(normalizeApplyPayload({ loanTenureYears: 15 }).loanTenure).toBe(180);
    expect(normalizeApplyPayload({ loanTenureYears: -1, loanTenureYearsCustom: 20 }).loanTenure).toBe(240);
  });

  it("merges transactionBanks into transactionBankName", () => {
    const payload = normalizeApplyPayload({
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC", "SBI"],
      transactionBankNameOther: "",
    });

    expect(payload.transactionBankName).toEqual(["HDFC", "SBI"]);
    expect(payload.transactionBanks).toBeUndefined();
    expect(payload.transactionBankOther).toBeFalsy();
  });

  it("drops server-owned fields and flattens the data wrapper", () => {
    const payload = normalizeApplyPayload({
      data: { monthlyNetSalary: 1000, status: "Approved", createdAt: "2026-01-01", user: "someone-else" },
    });

    expect(payload.monthlySalary).toBe(1000);
    expect(payload.status).toBeUndefined();
    expect(payload.createdAt).toBeUndefined();
    expect(payload.user).toBeUndefined();
  });
});

describe("applyValidator (dashboard quick-form payloads)", () => {
  const { applyValidator: homeApplyValidator } = require("../middleware/validators/homeLoanValidators");
  const { applyValidator: businessApplyValidator } = require("../middleware/validators/businessLoanValidators");

  it("home loan: accepts a business payload without buying-property fields", async () => {
    const result = await runChain(homeApplyValidator, dashboardBusinessPayload());
    expect(result.passed).toBe(true);
  });

  it("business loan: accepts the same dashboard payload", async () => {
    const result = await runChain(businessApplyValidator, dashboardBusinessPayload());
    expect(result.passed).toBe(true);
  });
});

describe("homeLoanController.apply (dashboard quick form)", () => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("saves the dashboard payload and forces the authenticated user", async () => {
    const createSpy = jest.spyOn(HomeLoan, "create").mockResolvedValue({
      toObject: () => ({ employmentType: "Self Employed - Business", businessState: "Maharashtra" }),
    });

    const payload = dashboardBusinessPayload({
      status: "Pending",
      loanType: "Car Loan",
      user: "some-other-user",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    await homeLoanController.apply({ body: payload, user: { id: "64f000000000000000000001" } }, res, jest.fn());

    expect(res.statusCode).toBe(201);
    const saved = createSpy.mock.calls[0][0];
    expect(saved.loanTenure).toBe(180);
    expect(saved.user).toBe("64f000000000000000000001");
    expect(saved.loanType).toBe("Home Loan");
    expect(saved.status).toBeUndefined();
    expect(saved.transactionBankName).toEqual({ displayName: "Multiple Transaction Banks", banks: ["HDFC", "SBI"] });
  });
});

describe("personalLoanController.apply (dashboard contract)", () => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("accepts dashboard aliases and forces the authenticated user", async () => {
    const createSpy = jest.spyOn(PersonalLoan, "create").mockResolvedValue({ _id: "p1" });

    const payload = normalizeApplyPayload({
      fullName: "Rohit Sharma",
      mobile: "9876543210",
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      loanAmount: 500000,
      loanTenure: 60,
      existingBanks: ["HDFC"],
      existingBanksOther: ["Yes Bank"],
      existingLoanTypes: ["Personal Loan"],
      existingLoanTypesOther: [],
      status: "Approved",
    });

    await personalLoanController.apply({ body: payload, user: { id: "64f000000000000000000001" } }, res, jest.fn());

    expect(res.statusCode).toBe(201);
    const saved = createSpy.mock.calls[0][0];
    expect(saved.monthlySalary).toBe(75000);
    expect(saved.otherBankList).toEqual(["Yes Bank"]);
    expect(saved.user).toBe("64f000000000000000000001");
    expect(saved.loanType).toBe("Personal Loan");
    expect(saved.status).toBeUndefined();
  });
});

describe("salaried salary-bank rules (dashboard Cash case)", () => {
  const { applyValidator: homeApplyValidator } = require("../middleware/validators/homeLoanValidators");
  const { salaryBankName } = require("../models/schemas/loanSections").employmentIncomeFields;

  const salariedPayload = (overrides = {}) => ({
    loanAmount: 1500000,
    loanTenure: 48,
    employmentType: "Salaried",
    companyName: "Cash Co",
    companyType: "Partnership",
    monthlySalary: 40000,
    salaryReceivedAs: "Cash",
    fullName: "Rohit Sharma",
    mobile: "9876543210",
    email: "rohit@example.com",
    dob: "1992-06-15",
    panNumber: "ABCDE1234F",
    state: "Maharashtra",
    city: "Pune",
    pincode: "411001",
    residenceStatus: "Owned",
    ...overrides,
  });

  it("does not require a salary bank name when the salary is received as cash", async () => {
    const result = await runChain(homeApplyValidator, salariedPayload());
    expect(result.passed).toBe(true);
    expect(salaryBankName.required.call({ employmentType: "Salaried", salaryReceivedAs: "Cash" })).toBe(false);
  });

  it("still requires a salary bank name for non-cash salaries", async () => {
    const result = await runChain(homeApplyValidator, salariedPayload({ salaryReceivedAs: "Bank Transfer" }));
    expect(result.passed).toBe(false);
    expect(salaryBankName.required.call({ employmentType: "Salaried", salaryReceivedAs: "Bank Transfer" })).toBe(true);
  });
});

const lapPayload = (overrides = {}) => ({
  loanAmount: 2500000,
  loanTenure: 120,
  collateralPropertyType: "Residential",
  collateralPropertyMarketValue: 6000000,
  collateralPropertyAge: 7,
  collateralPropertyState: "Maharashtra",
  collateralPropertyCity: "Pune",
  collateralPropertyPincode: "411001",
  existingEMI: 0,
  existingLoanAmount: 0,
  employmentType: "Self Employed - Business",
  businessType: "Proprietorship",
  businessName: "Aarav Traders",
  companyPanNumber: "ABCDE1234F",
  natureOfBusiness: "Retail",
  industryType: "Trading",
  businessEstablishedDate: "2018-05-12",
  transactionBankName: { displayName: "Multiple Transaction Banks", banks: ["HDFC", "SBI"] },
  lastYearTurnover: 2500000,
  last2YearsTurnover: 2300000,
  lastYearNetIncome: 350000,
  last2YearsNetIncome: 300000,
  businessState: "Maharashtra",
  businessCity: "Pune",
  businessPincode: "411001",
  businessPlaceStatus: "Owned",
  fullName: "Rohit Sharma",
  mobile: "9876543210",
  email: "rohit@example.com",
  dob: "1992-06-15",
  panNumber: "ABCDE1234F",
  state: "Maharashtra",
  city: "Pune",
  pincode: "411001",
  residenceStatus: "Owned",
  ...overrides,
});

describe("loanAgainstPropertyValidators.applyValidator", () => {
  const { applyValidator: lapApplyValidator } = require("../middleware/validators/loanAgainstPropertyValidators");

  it("passes a complete self-employed business payload", async () => {
    const result = await runChain(lapApplyValidator, lapPayload());
    expect(result.passed).toBe(true);
  });

  it("rejects a payload without collateral property details", async () => {
    const result = await runChain(lapApplyValidator, lapPayload({ collateralPropertyType: "" }));
    expect(result.passed).toBe(false);
  });

  it("rejects an applicant younger than 18", async () => {
    const result = await runChain(lapApplyValidator, lapPayload({ dob: "2015-01-01" }));
    expect(result.passed).toBe(false);
  });
});

describe("loanAgainstPropertyModel", () => {
  it("validates a complete business application", () => {
    const doc = new LoanAgainstProperty({ user: "64f000000000000000000001", ...lapPayload() });
    expect(doc.validateSync()).toBeUndefined();
  });

  it("requires collateral property details", () => {
    const doc = new LoanAgainstProperty({
      user: "64f000000000000000000001",
      loanAmount: 2500000,
      loanTenure: 120,
      employmentType: "Self Employed - Business",
      fullName: "Rohit Sharma",
      mobile: "9876543210",
      email: "rohit@example.com",
      dob: "1992-06-15",
      panNumber: "ABCDE1234F",
      state: "Maharashtra",
      city: "Pune",
      pincode: "411001",
      residenceStatus: "Owned",
    });

    const error = doc.validateSync();
    expect(error).toBeDefined();
    expect(Object.keys(error.errors)).toContain("collateralPropertyType");
  });
});

describe("loanAgainstPropertyController.apply", () => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps collateral + business fields and forces the authenticated user", async () => {
    const createSpy = jest.spyOn(LoanAgainstProperty, "create").mockResolvedValue({
      toObject: () => ({ employmentType: "Self Employed - Business", collateralPropertyState: "Maharashtra" }),
    });

    await LoanAgainstPropertyController.apply(
      { body: lapPayload({ status: "Pending", loanType: "Car Loan", user: "someone-else" }), user: { id: "64f000000000000000000001" } },
      res,
      jest.fn()
    );

    expect(res.statusCode).toBe(201);
    const saved = createSpy.mock.calls[0][0];
    expect(saved.user).toBe("64f000000000000000000001");
    expect(saved.loanType).toBe("Loan Against Property");
    expect(saved.status).toBeUndefined();
    expect(saved.collateralPropertyState).toBe("Maharashtra");
    expect(saved.collateralPropertyMarketValue).toBe(6000000);
    expect(saved.businessState).toBe("Maharashtra");
    expect(saved.profession).toBeUndefined();
    expect(saved.transactionBankName).toEqual({
      displayName: "Multiple Transaction Banks",
      banks: ["HDFC", "SBI"],
    });
  });
});

describe("adminApplicationController.listLoanAgainstProperties", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns sanitized LAP records", async () => {
    jest.spyOn(LoanAgainstProperty, "find").mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          employmentType: "Self Employed - Business",
          collateralPropertyState: "Maharashtra",
          profession: "Doctor",
          currentYearTurnover: 0,
          lastYearTurnover: 2500000,
        },
      ]),
    });

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await businessApplicationController.listLoanAgainstProperties({}, res, jest.fn());

    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data[0].collateralPropertyState).toBe("Maharashtra");
    expect(payload.data[0]).not.toHaveProperty("profession");
    expect(payload.data[0]).not.toHaveProperty("currentYearTurnover");
  });
});
