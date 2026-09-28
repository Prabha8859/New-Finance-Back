/**
 * Temporary end-to-end check for the loan apply APIs (run against a fresh server).
 * Creates a throwaway user, posts the exact dashboard payloads, then cleans up.
 *
 * Usage: PORT must point to a server started from this workspace.
 *   E2E_BASE=http://localhost:5055 node scripts/e2e-apply-check.js
 */
require("dotenv").config();

const mongoose = require("mongoose");

const User = require("../src/modules/auth/user.model");
const HomeLoan = require("../src/modules/loans/models/homeLoan.model");
const BusinessLoan = require("../src/modules/loans/models/businessLoan.model");
const PersonalLoan = require("../src/modules/loans/models/personalLoan.model");
const LoanAgainstProperty = require("../src/modules/loans/models/loanAgainstProperty.model");
const BalanceTransfer = require("../src/modules/loans/models/balanceTransfer.model");
const ProjectLoan = require("../src/modules/loans/models/projectLoan.model");
const CarLoan = require("../src/modules/loans/models/carLoan.model");
const EducationLoan = require("../src/modules/loans/models/educationLoan.model");
const CreditCard = require("../src/modules/loans/models/creditCard.model");
const Admin = require("../src/modules/admin/admin.model");
const generateToken = require("../src/shared/utils/generateToken");
const generateAdminToken = require("../src/shared/utils/generateAdminToken");

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
  {
    name: "12. BALANCE TRANSFER / Salaried (dashboard transfer payload)",
    path: "/api/balance-transfer/apply",
    expect: 201,
    check: (body) =>
      body.data.balanceTransferType === "Home loan" || `balanceTransferType=${body.data.balanceTransferType}`,
    body: {
      loanAmount: 1000000,
      loanTenureYears: 10,
      balanceTransferType: "Home loan",
      currentPropertyValue: 5000000,
      topUpAmount: 200000,
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "13. BALANCE TRANSFER / list endpoint (transfer fields)",
    path: "/api/balance-transfer/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      const item = body.data[0];
      if (!item) return "no balance transfer application in list";
      if (!item.balanceTransferType) return "balanceTransferType missing in response";
      return true;
    },
  },
  {
    name: "14. PROJECT LOAN / Salaried (dashboard project payload)",
    path: "/api/project-loan/apply",
    expect: 201,
    check: (body) => body.data.projectType === "Construction Project" || `projectType=${body.data.projectType}`,
    body: {
      loanAmount: 5000000,
      loanTenureYears: 10,
      projectType: "Construction Project",
      totalProjectCost: 10000000,
      projectStartDate: "2026-01-15",
      projectCompletionDate: "2028-06-30",
      ownInvestment: 2000000,
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "15. PROJECT LOAN / Business with dd/mm/yyyy dates + Other type",
    path: "/api/project-loan/apply",
    expect: 201,
    check: (body) =>
      body.data.projectType === "Hotel Project" || `projectType=${body.data.projectType}`,
    body: {
      loanAmount: 7500000,
      loanTenure: 180,
      projectType: "Other",
      projectTypeOther: "Hotel Project",
      totalProjectCost: 15000000,
      projectStartDate: "15/01/2026",
      projectCompletionDate: "30/06/2028",
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "12/05/2018",
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC Bank", "ICICI Bank"],
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
    name: "16. PROJECT LOAN / list endpoint (project fields)",
    path: "/api/project-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      const item = body.data[0];
      if (!item) return "no project loan application in list";
      if (!item.projectType) return "projectType missing in response";
      if (!item.totalProjectCost) return "totalProjectCost missing in response";
      return true;
    },
  },
  {
    name: "17. CAR LOAN / Salaried (dashboard vehicle payload)",
    path: "/api/car-loan/apply",
    expect: 201,
    check: (body) => body.data.vehicleType === "SUV" || `vehicleType=${body.data.vehicleType}`,
    body: {
      loanAmount: 800000,
      loanTenureYears: 7,
      vehicleType: "SUV",
      transmissionType: "Automatic",
      manufacturer: "Hyundai",
      model: "Creta",
      vehiclePurchaseType: "New Vehicle",
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "18. CAR LOAN / Business with Other vehicle type",
    path: "/api/car-loan/apply",
    expect: 201,
    check: (body) => body.data.vehicleType === "Tractor" || `vehicleType=${body.data.vehicleType}`,
    body: {
      loanAmount: 1200000,
      loanTenure: 60,
      vehicleType: "Other",
      vehicleTypeOther: "Tractor",
      vehiclePurchaseType: "Used Vehicle",
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "2018-05-12",
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC Bank", "ICICI Bank"],
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
    name: "19. CAR LOAN / list endpoint (vehicle fields)",
    path: "/api/car-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no car loan application in list";
      // The list has both applies: one with manufacturer, one with Other type.
      const withManufacturer = body.data.some((item) => item.manufacturer);
      const withVehicleType = body.data.some((item) => item.vehicleType);
      if (!withManufacturer) return "manufacturer missing in response";
      if (!withVehicleType) return "vehicleType missing in response";
      return true;
    },
  },
  {
    name: "20. EDUCATION LOAN / Salaried (dashboard education payload)",
    path: "/api/education-loan/apply",
    expect: 201,
    check: (body) => body.data.educationCountry === "Canada" || `educationCountry=${body.data.educationCountry}`,
    body: {
      loanAmount: 1500000,
      loanTenureYears: 10,
      educationCountry: "Canada",
      fieldOfStudy: "Computer Science / IT",
      courseName: "B.Tech Computer Science",
      university: "University of Toronto",
      instituteName: "Faculty of Applied Science",
      enrollmentStatus: "Admission Confirmed",
      courseDuration: 4,
      educationCost: 45,
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "21. EDUCATION LOAN / Business with Other country + Other study",
    path: "/api/education-loan/apply",
    expect: 201,
    check: (body) =>
      body.data.educationCountry === "Italy" && body.data.fieldOfStudy === "Design"
        ? true
        : `country=${body.data.educationCountry} study=${body.data.fieldOfStudy}`,
    body: {
      loanAmount: 2500000,
      loanTenure: 96,
      educationCountry: "Other",
      educationCountryOther: "Italy",
      fieldOfStudy: "Other",
      fieldOfStudyOther: "Design",
      courseName: "Masters in Industrial Design",
      university: "Politecnico di Milano",
      instituteName: "Design School",
      enrollmentStatus: "Other",
      enrollmentStatusOther: "Offer Letter Received",
      courseDuration: 2,
      educationCost: 35,
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "2018-05-12",
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC Bank", "ICICI Bank"],
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
    name: "22. EDUCATION LOAN / list endpoint (education fields)",
    path: "/api/education-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no education loan application in list";
      const item = body.data[0];
      if (!item.university) return "university missing in response";
      if (!item.courseName) return "courseName missing in response";
      return true;
    },
  },
  {
    name: "23. CREDIT CARD / Salaried (card details, no amount/tenure)",
    path: "/api/credit-card/apply",
    expect: 201,
    check: (body) => body.data.hasActiveCard === "Yes" || `hasActiveCard=${body.data.hasActiveCard}`,
    body: {
      hasActiveCard: "Yes",
      applyForBank: "HDFC",
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 75000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "24. CREDIT CARD / Business with Other bank",
    path: "/api/credit-card/apply",
    expect: 201,
    check: (body) => body.data.applyForBank === "IDFC First" || `applyForBank=${body.data.applyForBank}`,
    body: {
      hasActiveCard: "No",
      applyForBank: "Other",
      applyForBankOther: "IDFC First",
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Traders",
      companyPanNumber: "ABCDE1234F",
      natureOfBusiness: "Retail",
      industryType: "Trading",
      businessEstablishedDate: "2018-05-12",
      transactionBankName: "Multiple Transaction Banks",
      transactionBanks: ["HDFC Bank", "ICICI Bank"],
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
    name: "25. CREDIT CARD / list endpoint (card fields)",
    path: "/api/credit-card/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no credit card application in list";
      const item = body.data[0];
      if (item.hasActiveCard === undefined) return "hasActiveCard missing in response";
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

  const adminPlListRes = await fetch(`${BASE}/api/admin/project-loans`, { headers: adminHeaders });
  const adminPlListBody = await adminPlListRes.json().catch(() => ({}));
  const adminPlListOk = adminPlListRes.status === 200 && Array.isArray(adminPlListBody.data);
  results.push({
    name: "ADMIN / list project loans",
    status: adminPlListRes.status,
    ok: adminPlListOk,
    detail: adminPlListOk ? "" : JSON.stringify(adminPlListBody).slice(0, 200),
  });

  const [plApplication] = await ProjectLoan.find({ user: user._id }).limit(1);
  if (plApplication) {
    const plByIdRes = await fetch(`${BASE}/api/admin/project-loans/${plApplication._id}`, { headers: adminHeaders });
    const plByIdBody = await plByIdRes.json().catch(() => ({}));
    const plByIdOk =
      plByIdRes.status === 200 && plByIdBody.data && plByIdBody.data.projectType === "Construction Project";
    results.push({
      name: "ADMIN / get project loan by id",
      status: plByIdRes.status,
      ok: plByIdOk,
      detail: plByIdOk ? "" : JSON.stringify(plByIdBody).slice(0, 200),
    });
  }

  const adminClListRes = await fetch(`${BASE}/api/admin/car-loans`, { headers: adminHeaders });
  const adminClListBody = await adminClListRes.json().catch(() => ({}));
  const adminClListOk = adminClListRes.status === 200 && Array.isArray(adminClListBody.data);
  results.push({
    name: "ADMIN / list car loans",
    status: adminClListRes.status,
    ok: adminClListOk,
    detail: adminClListOk ? "" : JSON.stringify(adminClListBody).slice(0, 200),
  });

  const [clApplication] = await CarLoan.find({ user: user._id }).limit(1);
  if (clApplication) {
    const clByIdRes = await fetch(`${BASE}/api/admin/car-loans/${clApplication._id}`, { headers: adminHeaders });
    const clByIdBody = await clByIdRes.json().catch(() => ({}));
    const clByIdOk =
      clByIdRes.status === 200 && clByIdBody.data && clByIdBody.data.vehicleType === "SUV";
    results.push({
      name: "ADMIN / get car loan by id",
      status: clByIdRes.status,
      ok: clByIdOk,
      detail: clByIdOk ? "" : JSON.stringify(clByIdBody).slice(0, 200),
    });
  }

  const adminElListRes = await fetch(`${BASE}/api/admin/education-loans`, { headers: adminHeaders });
  const adminElListBody = await adminElListRes.json().catch(() => ({}));
  const adminElListOk = adminElListRes.status === 200 && Array.isArray(adminElListBody.data);
  results.push({
    name: "ADMIN / list education loans",
    status: adminElListRes.status,
    ok: adminElListOk,
    detail: adminElListOk ? "" : JSON.stringify(adminElListBody).slice(0, 200),
  });

  const [elApplication] = await EducationLoan.find({ user: user._id }).limit(1);
  if (elApplication) {
    const elByIdRes = await fetch(`${BASE}/api/admin/education-loans/${elApplication._id}`, { headers: adminHeaders });
    const elByIdBody = await elByIdRes.json().catch(() => ({}));
    const elByIdOk =
      elByIdRes.status === 200 && elByIdBody.data && elByIdBody.data.educationCountry === "Canada";
    results.push({
      name: "ADMIN / get education loan by id",
      status: elByIdRes.status,
      ok: elByIdOk,
      detail: elByIdOk ? "" : JSON.stringify(elByIdBody).slice(0, 200),
    });
  }

  const adminCcListRes = await fetch(`${BASE}/api/admin/credit-cards`, { headers: adminHeaders });
  const adminCcListBody = await adminCcListRes.json().catch(() => ({}));
  const adminCcListOk = adminCcListRes.status === 200 && Array.isArray(adminCcListBody.data);
  results.push({
    name: "ADMIN / list credit cards",
    status: adminCcListRes.status,
    ok: adminCcListOk,
    detail: adminCcListOk ? "" : JSON.stringify(adminCcListBody).slice(0, 200),
  });

  const [ccApplication] = await CreditCard.find({ user: user._id }).limit(1);
  if (ccApplication) {
    const ccByIdRes = await fetch(`${BASE}/api/admin/credit-cards/${ccApplication._id}`, { headers: adminHeaders });
    const ccByIdBody = await ccByIdRes.json().catch(() => ({}));
    const ccByIdOk =
      ccByIdRes.status === 200 && ccByIdBody.data && ccByIdBody.data.hasActiveCard === "Yes";
    results.push({
      name: "ADMIN / get credit card by id",
      status: ccByIdRes.status,
      ok: ccByIdOk,
      detail: ccByIdOk ? "" : JSON.stringify(ccByIdBody).slice(0, 200),
    });
  }

  const adminBtListRes = await fetch(`${BASE}/api/admin/balance-transfers`, { headers: adminHeaders });
  const adminBtListBody = await adminBtListRes.json().catch(() => ({}));
  const adminBtListOk = adminBtListRes.status === 200 && Array.isArray(adminBtListBody.data);
  results.push({
    name: "ADMIN / list balance transfers",
    status: adminBtListRes.status,
    ok: adminBtListOk,
    detail: adminBtListOk ? "" : JSON.stringify(adminBtListBody).slice(0, 200),
  });

  const [btApplication] = await BalanceTransfer.find({ user: user._id }).limit(1);
  if (btApplication) {
    const btByIdRes = await fetch(`${BASE}/api/admin/balance-transfers/${btApplication._id}`, { headers: adminHeaders });
    const btByIdBody = await btByIdRes.json().catch(() => ({}));
    const btByIdOk =
      btByIdRes.status === 200 && btByIdBody.data && btByIdBody.data.balanceTransferType === "Home loan";
    results.push({
      name: "ADMIN / get balance transfer by id",
      status: btByIdRes.status,
      ok: btByIdOk,
      detail: btByIdOk ? "" : JSON.stringify(btByIdBody).slice(0, 200),
    });
  }

  // Cleanup: remove everything this script created.
  await HomeLoan.deleteMany({ user: user._id });
  await BusinessLoan.deleteMany({ user: user._id });
  await PersonalLoan.deleteMany({ user: user._id });
  await LoanAgainstProperty.deleteMany({ user: user._id });
  await BalanceTransfer.deleteMany({ user: user._id });
  await ProjectLoan.deleteMany({ user: user._id });
  await CarLoan.deleteMany({ user: user._id });
  await EducationLoan.deleteMany({ user: user._id });
  await CreditCard.deleteMany({ user: user._id });
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
