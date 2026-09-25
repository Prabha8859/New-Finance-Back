/**
 * Temporary end-to-end check for the loan apply APIs (run against a fresh server).
 * Creates a throwaway user, posts the exact dashboard payloads, then cleans up.
 *
 * Usage: PORT must point to a server started from this workspace.
 *   E2E_BASE=http://localhost:5055 node scripts/e2e-apply-check.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../models/User");
const HomeLoan = require("../models/HomeLoan");
const BusinessLoan = require("../models/BusinessLoan");
const PersonalLoan = require("../models/PersonalLoan");
const LoanAgainstProperty = require("../models/LoanAgainstProperty");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");
const generateAdminToken = require("../utils/generateAdminToken");

const BASE = process.env.E2E_BASE || "http://localhost:5055";
const mobile = `9${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;
const email = `e2e.${Date.now()}@example.com`;

const personal = {
  fullName: "E2E Test",
  mobile,
  email,
  dob: "1992-06-15",
  panNumber: "ABCDE1234F",
  state: "Maharashtra",
  city: "Pune",
  pincode: "411001",
  residenceStatus: "Owned",
  existingEMI: 0,
  existingLoanAmount: 0,
};

const cases = [
  {
    name: "1. HOME / Business (exact payload user bhejta hai)",
    path: "/api/home-loan/apply",
    expect: 201,
    body: {
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
      ...personal,
    },
  },
  {
    name: "2. HOME / Salaried (dashboard quick form: loanTenureYears + monthlyNetSalary)",
    path: "/api/home-loan/apply",
    expect: 201,
    check: (body) => body.data.loanTenure === 60 || `loanTenure=${body.data.loanTenure}`,
    body: {
      loanAmount: 3000000,
      loanTenureYears: 5,
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      existingBanks: ["HDFC"],
      existingBanksOther: ["Yes Bank"],
      existingLoanTypes: ["Car Loan"],
      existingLoanTypesOther: [],
      status: "Pending",
      createdAt: "2026-09-25T00:00:00.000Z",
      ...personal,
    },
  },
  {
    name: "3. HOME / Salaried with salaryReceivedAs=Cash (dashboard bank name skip karta hai)",
    path: "/api/home-loan/apply",
    expect: 201,
    body: {
      loanAmount: 1500000,
      loanTenureYears: 4,
      employmentType: "Salaried",
      companyName: "Cash Co",
      companyType: "Partnership",
      monthlyNetSalary: 40000,
      salaryReceivedAs: "Cash",
      status: "Pending",
      ...personal,
    },
  },
  {
    name: "4. HOME / Professional (dashboard quick form)",
    path: "/api/home-loan/apply",
    expect: 201,
    body: {
      loanAmount: 2000000,
      loanTenureYears: 8,
      employmentType: "Self Employed - Professional",
      profession: "Doctor",
      currentYearTurnover: 500000,
      priorYearTurnover: 450000,
      currentYearNetIncome: 70000,
      previousYearNetIncome: 65000,
      businessState: "Maharashtra",
      businessCity: "Pune",
      businessPincode: "411001",
      businessPlaceStatus: "Owned",
      status: "Pending",
      ...personal,
    },
  },
  {
    name: "5. BUSINESS / dashboards transactionBanks array",
    path: "/api/business-loan/apply",
    expect: 201,
    body: {
      loanAmount: 1000000,
      loanTenureYears: 10,
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "2018-05-12T00:00:00.000Z",
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC", "SBI", "ICICI"],
      lastYearTurnover: 2500000,
      last2YearsTurnover: 2300000,
      lastYearNetIncome: 350000,
      last2YearsNetIncome: 300000,
      businessState: "Maharashtra",
      businessCity: "Pune",
      businessPincode: "411001",
      businessPlaceStatus: "Owned",
      existingBanks: [],
      existingBanksOther: [],
      existingLoanTypes: [],
      existingLoanTypesOther: [],
      status: "Pending",
      ...personal,
    },
  },
  {
    name: "6. PERSONAL / dashboard aliases (monthlyNetSalary, existingBanksOther)",
    path: "/api/personal-loan/apply",
    expect: 201,
    body: {
      loanAmount: 500000,
      loanTenure: 60,
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      existingBanks: ["HDFC"],
      existingBanksOther: ["Yes Bank"],
      existingLoanTypes: ["Personal Loan"],
      existingLoanTypesOther: [],
      ...personal,
    },
  },
  {
    name: "7. LAP / Business (Loan Against Property dashboard payload)",
    path: "/api/loan-against-property/apply",
    expect: 201,
    check: (body) =>
      body.data.collateralPropertyState === "Maharashtra" ||
      `collateralPropertyState=${body.data.collateralPropertyState}`,
    body: {
      loanAmount: 2500000,
      loanTenureYears: 10,
      collateralPropertyType: "Residential",
      collateralPropertyMarketValue: 6000000,
      collateralPropertyAge: 7,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "2018-05-12T00:00:00.000Z",
      transactionBankName: {
        displayName: "Multiple Transaction Banks",
        banks: ["HDFC", "SBI", "ICICI"],
      },
      lastYearTurnover: 2500000,
      last2YearsTurnover: 2300000,
      lastYearNetIncome: 350000,
      last2YearsNetIncome: 300000,
      businessState: "Maharashtra",
      businessCity: "Pune",
      businessPincode: "411001",
      businessPlaceStatus: "Owned",
      existingBanks: [],
      existingBanksOther: [],
      existingLoanTypes: [],
      existingLoanTypesOther: [],
      status: "Pending",
      createdAt: "2026-09-25T00:00:00.000Z",
      ...personal,
    },
  },
  {
    name: "8. LAP / Salaried with salaryReceivedAs=Cash",
    path: "/api/loan-against-property/apply",
    expect: 201,
    body: {
      loanAmount: 1500000,
      loanTenureYears: 5,
      collateralPropertyType: "Commercial",
      collateralPropertyMarketValue: 4000000,
      collateralPropertyAge: 12,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
      employmentType: "Salaried",
      companyName: "Cash Co",
      companyType: "Partnership",
      monthlyNetSalary: 45000,
      salaryReceivedAs: "Cash",
      ...personal,
    },
  },
  {
    name: "9. LAP / Professional",
    path: "/api/loan-against-property/apply",
    expect: 201,
    body: {
      loanAmount: 2000000,
      loanTenureYears: 8,
      collateralPropertyType: "Residential",
      collateralPropertyMarketValue: 5000000,
      collateralPropertyAge: 4,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
      employmentType: "Self Employed - Professional",
      profession: "Doctor",
      currentYearTurnover: 500000,
      priorYearTurnover: 450000,
      currentYearNetIncome: 70000,
      previousYearNetIncome: 65000,
      businessState: "Maharashtra",
      businessCity: "Pune",
      businessPincode: "411001",
      businessPlaceStatus: "Owned",
      ...personal,
    },
  },
  {
    name: "10. LAP / list endpoint (response fields)",
    path: "/api/loan-against-property/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      const business = body.data.find((item) => item.employmentType === "Self Employed - Business");
      if (!business) return "no business LAP application in list";
      if (!business.collateralPropertyState) return "collateralPropertyState missing in response";
      if (business.profession) return "professional field leaked into business response";
      return true;
    },
  },
  {
    name: "11. HOME / list endpoint (response fields)",
    path: "/api/home-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      const business = body.data.find((item) => item.employmentType === "Self Employed - Business");
      if (!business) return "no business application in list";
      if (!business.businessState) return "businessState missing in response";
      if (business.profession) return "professional field leaked into business response";
      return true;
    },
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.create({ name: "E2E Test", mobile, email, isVerified: true });
  const token = generateToken(user);
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const results = [];

  for (const testCase of cases) {
    const method = testCase.method || "POST";
    const response = await fetch(`${BASE}${testCase.path}`, {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(testCase.body),
    });
    const body = await response.json().catch(() => ({}));

    let ok = response.status === testCase.expect;
    let detail = "";

    if (ok && testCase.check) {
      const checkResult = testCase.check(body);
      if (checkResult !== true) {
        ok = false;
        detail = String(checkResult);
      }
    }

    if (!ok) {
      detail = detail || JSON.stringify(body.errors || body.message || body).slice(0, 300);
    }

    results.push({ name: testCase.name, status: response.status, ok, detail, body });
  }

  /* ---------- Admin endpoints ---------- */
  const admin = await Admin.create({
    name: "E2E Admin",
    email: `e2e.admin.${Date.now()}@example.com`,
    password: "e2e-temp-password",
    role: "Admin",
  });
  const adminHeaders = { Authorization: `Bearer ${generateAdminToken(admin)}` };

  const adminListRes = await fetch(`${BASE}/api/admin/loan-against-properties`, { headers: adminHeaders });
  const adminListBody = await adminListRes.json().catch(() => ({}));
  const adminListOk = adminListRes.status === 200 && Array.isArray(adminListBody.data);
  results.push({
    name: "ADMIN / list loan against properties",
    status: adminListRes.status,
    ok: adminListOk,
    detail: adminListOk ? "" : JSON.stringify(adminListBody).slice(0, 200),
  });

  const [lapApplication] = await LoanAgainstProperty.find({ user: user._id }).limit(1);
  if (lapApplication) {
    const byIdRes = await fetch(`${BASE}/api/admin/loan-against-properties/${lapApplication._id}`, { headers: adminHeaders });
    const byIdBody = await byIdRes.json().catch(() => ({}));
    const byIdOk =
      byIdRes.status === 200 && byIdBody.data && byIdBody.data.collateralPropertyState === "Maharashtra";
    results.push({
      name: "ADMIN / get loan against property by id",
      status: byIdRes.status,
      ok: byIdOk,
      detail: byIdOk ? "" : JSON.stringify(byIdBody).slice(0, 200),
    });
  }

  // Cleanup: remove everything this script created.
  await HomeLoan.deleteMany({ user: user._id });
  await BusinessLoan.deleteMany({ user: user._id });
  await PersonalLoan.deleteMany({ user: user._id });
  await LoanAgainstProperty.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  await Admin.deleteOne({ _id: admin._id });

  console.log("\n=== APPLY API END-TO-END RESULTS ===");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} | ${result.status} | ${result.name}${result.detail ? ` -> ${result.detail}` : ""}`);
  }
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed (test data cleaned up)`);

  // E2E_VERBOSE=1 prints a saved application (first case, or E2E_VERBOSE_CASE by name).
  if (process.env.E2E_VERBOSE === "1") {
    const wanted = process.env.E2E_VERBOSE_CASE;
    const target = wanted ? results.find((result) => result.name.includes(wanted)) : results[0];

    if (target) {
      console.log(`\n=== RESPONSE BODY: ${target.name} ===`);
      console.log(JSON.stringify(target.body, null, 2));
    }
  }

  await mongoose.disconnect();
  process.exit(results.every((r) => r.ok) ? 0 : 1);
};

run().catch(async (error) => {
  console.error("E2E run failed:", error.message);
  process.exit(1);
});
