const { registerValidator } = require("../middleware/validators/authValidators");
const { applyValidator } = require("../middleware/validators/personalLoanValidators");
const { normalizeTransactionBankNames, sanitizeBusinessLoanResponse } = require("../controllers/businessLoan.controller");
const { appendUniqueValue } = require("../services/admin/master.service");
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
