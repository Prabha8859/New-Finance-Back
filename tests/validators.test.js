const { registerValidator } = require("../middleware/validators/authValidators");
const { applyValidator } = require("../middleware/validators/personalLoanValidators");
const { appendUniqueValue } = require("../services/admin/master.service");

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
