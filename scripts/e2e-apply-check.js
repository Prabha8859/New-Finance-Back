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
const HomeLoan = require("../src/modules/loans/home-loan/homeLoan.model");
const BusinessLoan = require("../src/modules/loans/business-loan/businessLoan.model");
const PersonalLoan = require("../src/modules/loans/personal-loan/personalLoan.model");
const LoanAgainstProperty = require("../src/modules/loans/loan-against-property/loanAgainstProperty.model");
const BalanceTransfer = require("../src/modules/loans/balance-transfer/balanceTransfer.model");
const ProjectLoan = require("../src/modules/loans/project-loan/projectLoan.model");
const VehicleLoan = require("../src/modules/loans/vehicle-loan/vehicleLoan.model");
const EducationLoan = require("../src/modules/loans/education-loan/educationLoan.model");
const CreditCard = require("../src/modules/loans/credit-card/creditCard.model");
const CommercialPurchase = require("../src/modules/loans/commercial-purchase/commercialPurchase.model");
const WorkingCapital = require("../src/modules/loans/working-capital/workingCapital.model");
const LeaseRentalDiscounting = require("../src/modules/loans/lease-rental-discounting/leaseRentalDiscounting.model");
const OdCcLimit = require("../src/modules/loans/od-cc-limit/odCcLimit.model");
const LoanAgainstShare = require("../src/modules/loans/loan-against-share/loanAgainstShare.model");
const FilmFunding = require("../src/modules/loans/film-funding/filmFunding.model");
const FdiLoan = require("../src/modules/loans/fdi-loan/fdiLoan.model");
const NpaLoan = require("../src/modules/loans/npa-loan/npaLoan.model");
const GoldLoan = require("../src/modules/loans/gold-loan/goldLoan.model");
const Admin = require("../src/modules/admin/admin.model");
const generateToken = require("../src/utils/generateToken");
const generateAdminToken = require("../src/utils/generateAdminToken");

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
    check: (body) => body.data.loanTenure === 5 || `loanTenure=${body.data.loanTenure}`,
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
      existingLoanTypes: ["Vehicle Loan"],
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
      loanTenure: 5,
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
      loanTenure: 15,
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
    name: "17. VEHICLE LOAN / Salaried (dashboard vehicle payload)",
    path: "/api/vehicle-loan/apply",
    expect: 201,
    check: (body) => body.data.vehicleType === "SUV" || `vehicleType=${body.data.vehicleType}`,
    body: {
      loanAmount: 800000,
      loanTenureYears: 7,
      vehicleType: "SUV",
      transmissionType: "Automatic",
      fuelType: "Petrol",
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
    name: "18. VEHICLE LOAN / Business with Other vehicle type",
    path: "/api/vehicle-loan/apply",
    expect: 201,
    check: (body) => body.data.vehicleType === "Tractor" || `vehicleType=${body.data.vehicleType}`,
    body: {
      loanAmount: 1200000,
      loanTenure: 5,
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
    name: "19. VEHICLE LOAN / list endpoint (vehicle fields)",
    path: "/api/vehicle-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no vehicle loan application in list";
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
      loanTenure: 8,
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
  {
    name: "26. COMMERCIAL PURCHASE / Salaried (commercial property payload)",
    path: "/api/commercial-purchase/apply",
    expect: 201,
    check: (body) =>
      body.data.buyingPropertyMarketValue === 6000000 || `buyingPropertyMarketValue=${body.data.buyingPropertyMarketValue}`,
    body: {
      loanAmount: 5000000,
      loanTenureYears: 10,
      buyingPropertyType: "Commercial",
      buyingPropertyMarketValue: 6000000,
      buyingPropertyAge: 3,
      buyingPropertyState: "Maharashtra",
      buyingPropertyCity: "Pune",
      buyingPropertyPincode: "411001",
      employmentType: "Salaried",
      companyName: "ABC Corp",
      companyType: "Private Limited",
      monthlyNetSalary: 90000,
      salaryReceivedAs: "Bank Transfer",
      salaryBankName: "HDFC Bank",
      ...personal,
    },
  },
  {
    name: "27. COMMERCIAL PURCHASE / Business with Other property type",
    path: "/api/commercial-purchase/apply",
    expect: 201,
    check: (body) =>
      body.data.buyingPropertyType === "Warehouse" || `buyingPropertyType=${body.data.buyingPropertyType}`,
    body: {
      loanAmount: 9000000,
      loanTenure: 10,
      buyingPropertyType: "Other",
      buyingPropertyTypeOther: "Warehouse",
      buyingPropertyMarketValue: 12000000,
      buyingPropertyAge: 8,
      buyingPropertyState: "Gujarat",
      buyingPropertyCity: "Ahmedabad",
      buyingPropertyPincode: "380001",
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
    name: "28. COMMERCIAL PURCHASE / list endpoint (property fields)",
    path: "/api/commercial-purchase/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no commercial purchase application in list";
      const item = body.data[0];
      if (!item.buyingPropertyType) return "buyingPropertyType missing in response";
      if (!item.buyingPropertyMarketValue) return "buyingPropertyMarketValue missing in response";
      return true;
    },
  },
  {
    name: "29. WORKING CAPITAL / Salaried (collateral property payload)",
    path: "/api/working-capital/apply",
    expect: 201,
    check: (body) =>
      body.data.collateralPropertyType === "Residential Property" || `collateralPropertyType=${body.data.collateralPropertyType}`,
    body: {
      loanAmount: 2000000,
      loanTenureYears: 5,
      collateralPropertyType: "Residential Property",
      collateralPropertyMarketValue: 5000000,
      collateralPropertyAge: 10,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
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
    name: "30. WORKING CAPITAL / Business with Other collateral type",
    path: "/api/working-capital/apply",
    expect: 201,
    check: (body) =>
      body.data.collateralPropertyType === "Warehouse" || `collateralPropertyType=${body.data.collateralPropertyType}`,
    body: {
      loanAmount: 5000000,
      loanTenure: 5,
      collateralPropertyType: "Other",
      collateralPropertyTypeOther: "Warehouse",
      collateralPropertyMarketValue: 9000000,
      collateralPropertyAge: 8,
      collateralPropertyState: "Gujarat",
      collateralPropertyCity: "Ahmedabad",
      collateralPropertyPincode: "380001",
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
    name: "31. WORKING CAPITAL / list endpoint (collateral fields)",
    path: "/api/working-capital/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no working capital application in list";
      const item = body.data[0];
      if (!item.collateralPropertyType) return "collateralPropertyType missing in response";
      if (!item.collateralPropertyMarketValue) return "collateralPropertyMarketValue missing in response";
      return true;
    },
  },
  {
    name: "32. LEASE RENTAL DISCOUNTING / Salaried (lease property payload)",
    path: "/api/lease-rental-discounting/apply",
    expect: 201,
    check: (body) =>
      body.data.leasePropertyState === "Maharashtra" || `leasePropertyState=${body.data.leasePropertyState}`,
    body: {
      loanAmount: 5000000,
      loanTenureYears: 10,
      monthlyLeaseIncome: 80000,
      totalLeaseAmount: 9600000,
      leasePropertyDuration: 10,
      leasePropertyMarketValue: 6000000,
      leasePropertyAge: 5,
      leasePropertyState: "Maharashtra",
      leasePropertyCity: "Pune",
      leasePropertyPincode: "411001",
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
    name: "33. LEASE RENTAL DISCOUNTING / Business with Other pincode",
    path: "/api/lease-rental-discounting/apply",
    expect: 201,
    check: (body) =>
      body.data.leasePropertyPincode === "380099" || `leasePropertyPincode=${body.data.leasePropertyPincode}`,
    body: {
      loanAmount: 8000000,
      loanTenure: 10,
      leasePropertyState: "Gujarat",
      leasePropertyCity: "Ahmedabad",
      leasePropertyPincode: "Other",
      leasePropertyPincodeOther: "380099",
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
    name: "34. LEASE RENTAL DISCOUNTING / list endpoint (lease fields)",
    path: "/api/lease-rental-discounting/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no lease rental discounting application in list";
      const item = body.data[0];
      if (!item.leasePropertyState) return "leasePropertyState missing in response";
      if (!item.leasePropertyPincode) return "leasePropertyPincode missing in response";
      return true;
    },
  },
  {
    name: "35. OD / CC LIMIT / Salaried (collateral property payload)",
    path: "/api/od-cc-limit/apply",
    expect: 201,
    check: (body) =>
      body.data.collateralPropertyType === "Residential Property" || `collateralPropertyType=${body.data.collateralPropertyType}`,
    body: {
      loanAmount: 2000000,
      loanTenureYears: 5,
      collateralPropertyType: "Residential Property",
      collateralPropertyMarketValue: 5000000,
      collateralPropertyAge: 10,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
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
    name: "36. OD / CC LIMIT / Unsecured (business, no property backing)",
    path: "/api/od-cc-limit/apply",
    expect: 201,
    check: (body) =>
      body.data.collateralPropertyType === "Unsecured" || `collateralPropertyType=${body.data.collateralPropertyType}`,
    body: {
      loanAmount: 5000000,
      loanTenure: 10,
      collateralPropertyType: "Unsecured",
      collateralPropertyMarketValue: 1,
      collateralPropertyAge: 0,
      collateralPropertyState: "Gujarat",
      collateralPropertyCity: "Ahmedabad",
      collateralPropertyPincode: "380001",
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
    name: "37. OD / CC LIMIT / 2-year tenure rejected (range is 3-40 years)",
    path: "/api/od-cc-limit/apply",
    expect: 400,
    body: {
      loanAmount: 2000000,
      loanTenureYears: 2,
      collateralPropertyType: "Residential Property",
      collateralPropertyMarketValue: 5000000,
      collateralPropertyAge: 10,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
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
    name: "38. OD / CC LIMIT / list endpoint (collateral fields)",
    path: "/api/od-cc-limit/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no OD / CC limit application in list";
      const item = body.data[0];
      if (!item.collateralPropertyType) return "collateralPropertyType missing in response";
      if (!item.collateralPropertyMarketValue) return "collateralPropertyMarketValue missing in response";
      return true;
    },
  },
  {
    name: "39. LOAN AGAINST SHARE / Salaried (share payload)",
    path: "/api/loan-against-share/apply",
    expect: 201,
    check: (body) =>
      body.data.shareCompanyName === "Reliance Industries" || `shareCompanyName=${body.data.shareCompanyName}`,
    body: {
      loanAmount: 1000000,
      loanTenureYears: 5,
      shareCompanyName: "Reliance Industries",
      valueOfOneShare: 2500,
      quantityOfShare: 500,
      totalShareValue: 1250000,
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
    name: "40. LOAN AGAINST SHARE / Business (no totalShareValue sent)",
    path: "/api/loan-against-share/apply",
    expect: 201,
    check: (body) =>
      body.data.quantityOfShare === 1200 || `quantityOfShare=${body.data.quantityOfShare}`,
    body: {
      loanAmount: 3000000,
      loanTenure: 7,
      shareCompanyName: "Tata Consultancy Services",
      valueOfOneShare: 4000,
      quantityOfShare: 1200,
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
    name: "41. LOAN AGAINST SHARE / list endpoint (share fields)",
    path: "/api/loan-against-share/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no loan against share application in list";
      const item = body.data[0];
      if (!item.shareCompanyName) return "shareCompanyName missing in response";
      if (!item.valueOfOneShare) return "valueOfOneShare missing in response";
      return true;
    },
  },
  {
    name: "42. FILM FUNDING / Salaried (filmLanguages + starCastNames as arrays)",
    path: "/api/film-funding/apply",
    expect: 201,
    check: (body) =>
      (Array.isArray(body.data.filmLanguages) && body.data.filmLanguages.includes("Hindi")) ||
      `filmLanguages=${JSON.stringify(body.data.filmLanguages)}`,
    body: {
      loanAmount: 5000000,
      loanTenureYears: 5,
      filmComesUnder: "Bollywood",
      filmLanguages: ["Hindi", "English"],
      starCastNames: ["Aamir Khan", "Alia Bhatt"],
      totalProjectCost: 20000000,
      ownInvestmentAmount: 5000000,
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
    name: "43. FILM FUNDING / Business (CSV strings + industry Other)",
    path: "/api/film-funding/apply",
    expect: 201,
    check: (body) =>
      (body.data.filmLanguages.length === 3 && body.data.filmLanguages[2] === "Kannada") ||
      `filmLanguages=${JSON.stringify(body.data.filmLanguages)}`,
    body: {
      loanAmount: 8000000,
      loanTenure: 7,
      filmComesUnder: "Other",
      filmComesUnderOther: "Kannada Industry",
      filmLanguages: "Hindi, English , Kannada",
      starCastNames: "Rishab Shetty, Raj B Shetty",
      totalProjectCost: 30000000,
      ownInvestmentAmount: 8000000,
      employmentType: "Self Employed - Business",
      businessType: "Proprietorship",
      businessName: "Aarav Productions",
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
    name: "44. FILM FUNDING / list endpoint (film fields + sections)",
    path: "/api/film-funding/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no film funding application in list";
      const item = body.data[0];
      if (!item.filmComesUnder) return "filmComesUnder missing in response";
      if (!item.totalProjectCost) return "totalProjectCost missing in response";
      if (!Array.isArray(item.starCastNames)) return "starCastNames is not an array in response";
      if (!item.sections || !item.sections.loanRequirements) return "sections.loanRequirements missing";
      return true;
    },
  },
  {
    name: "45. FILM FUNDING / own investment below 20% of project cost -> rejected",
    path: "/api/film-funding/apply",
    expect: 400,
    body: {
      loanAmount: 5000000,
      loanTenure: 5,
      filmComesUnder: "Bollywood",
      filmLanguages: ["Hindi"],
      starCastNames: ["Aamir Khan"],
      totalProjectCost: 20000000,
      ownInvestmentAmount: 3000000,
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
    name: "46. NPA LOAN / Salaried (no loanAmount/loanTenure — NPA account details only)",
    path: "/api/npa-loan/apply",
    expect: 201,
    check: (body) =>
      body.data.npaStatus === "1-6 Months" || `npaStatus=${body.data.npaStatus}`,
    body: {
      npaStatus: "1-6 Months",
      npaPrincipalLoanAmount: 2000000,
      npaCurrentOutstandingAmount: 2500000,
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
    name: "47. NPA LOAN / Business with Other status (Other + free text merge)",
    path: "/api/npa-loan/apply",
    expect: 201,
    check: (body) =>
      body.data.npaStatus === "Suit Filed" || `npaStatus=${body.data.npaStatus}`,
    body: {
      npaStatus: "Other",
      npaStatusOther: "Suit Filed",
      npaPrincipalLoanAmount: 5000000,
      npaCurrentOutstandingAmount: 6200000,
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
    name: "48. NPA LOAN / missing npaCurrentOutstandingAmount -> rejected",
    path: "/api/npa-loan/apply",
    expect: 400,
    body: {
      npaStatus: "12 Months",
      npaPrincipalLoanAmount: 2000000,
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
    name: "49. NPA LOAN / list endpoint (npa fields + sections)",
    path: "/api/npa-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no npa loan application in list";
      const item = body.data[0];
      if (!item.npaStatus) return "npaStatus missing in response";
      if (item.npaPrincipalLoanAmount === undefined) return "npaPrincipalLoanAmount missing in response";
      if (!item.sections || !item.sections.loanRequirements) return "sections.loanRequirements missing";
      return true;
    },
  },
  {
    name: "50. GOLD LOAN / Salaried (gold payload, tenure in years)",
    path: "/api/gold-loan/apply",
    expect: 201,
    check: (body) =>
      (body.data.typeOfLoan === "Jewellery" && body.data.goldCarats === "22 Karat" && body.data.loanTenure === 5) ||
      `typeOfLoan=${body.data.typeOfLoan}, goldCarats=${body.data.goldCarats}, loanTenure=${body.data.loanTenure}`,
    body: {
      loanAmount: 300000,
      loanTenureYears: 5,
      typeOfLoan: "Jewellery",
      goldCarats: "22 Karat",
      goldWeight: 20,
      collateralPropertyMarketValue: 500000,
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
    name: "51. GOLD LOAN / Business with Other type + Other carats (both merge)",
    path: "/api/gold-loan/apply",
    expect: 201,
    check: (body) =>
      (body.data.typeOfLoan === "Utensils" && body.data.goldCarats === "14 Karat") ||
      `typeOfLoan=${body.data.typeOfLoan}, goldCarats=${body.data.goldCarats}`,
    body: {
      loanAmount: 500000,
      loanTenure: 3,
      typeOfLoan: "Other",
      typeOfLoanOther: "Utensils",
      goldCarats: "Other",
      goldCaratsOther: "14 Karat",
      goldWeight: 35,
      collateralPropertyMarketValue: 900000,
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
    name: "52. GOLD LOAN / missing goldWeight -> rejected",
    path: "/api/gold-loan/apply",
    expect: 400,
    body: {
      loanAmount: 300000,
      loanTenure: 3,
      typeOfLoan: "Coin",
      goldCarats: "24 Karat",
      collateralPropertyMarketValue: 500000,
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
    name: "53. GOLD LOAN / list endpoint (gold fields + sections)",
    path: "/api/gold-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      if (!body.data.length) return "no gold loan application in list";
      const item = body.data[0];
      if (!item.typeOfLoan) return "typeOfLoan missing in response";
      if (!item.goldCarats) return "goldCarats missing in response";
      if (!item.goldWeight) return "goldWeight missing in response";
      if (!item.sections || !item.sections.loanRequirements) return "sections.loanRequirements missing";
      return true;
    },
  },
  {
    name: "54. FDI LOAN / Salaried (100 Cr minimum + more-than-10-years option)",
    path: "/api/fdi-loan/apply",
    expect: 201,
    check: (body) =>
      body.data.loanTenure === 11 &&
      body.data.collateralPropertyType === "Industrial Property" &&
      body.data.sections?.loanRequirements?.collateralPropertyMarketValue === 1000000000
        ? true
        : `loanTenure=${body.data?.loanTenure}, collateralPropertyType=${body.data?.collateralPropertyType}`,
    body: {
      loanAmount: 1000000000,
      loanTenureYears: "-1",
      loanTenureYearsCustom: "11",
      collateralPropertyType: "Other",
      collateralPropertyTypeOther: "Industrial Property",
      collateralPropertyMarketValue: 1000000000,
      collateralPropertyAge: 5,
      collateralPropertyState: "Maharashtra",
      collateralPropertyCity: "Pune",
      collateralPropertyPincode: "411001",
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
    name: "55. FDI LOAN / list endpoint (requirements + shared sections)",
    path: "/api/fdi-loan/applications",
    method: "GET",
    expect: 200,
    check: (body) => {
      const item = body.data.find((application) => application.loanType === "FDI Loan");
      if (!item) return "no FDI loan application in list";
      if (item.loanTenure !== 11) return `loanTenure=${item.loanTenure}`;
      if (!item.sections?.incomeDetails || !item.sections?.existingLoanExposure || !item.sections?.personalDetails) {
        return "shared loan sections missing from response";
      }
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

  const adminVlListRes = await fetch(`${BASE}/api/admin/vehicle-loans`, { headers: adminHeaders });
  const adminVlListBody = await adminVlListRes.json().catch(() => ({}));
  const adminVlListOk = adminVlListRes.status === 200 && Array.isArray(adminVlListBody.data);
  results.push({
    name: "ADMIN / list vehicle loans",
    status: adminVlListRes.status,
    ok: adminVlListOk,
    detail: adminVlListOk ? "" : JSON.stringify(adminVlListBody).slice(0, 200),
  });

  const [vlApplication] = await VehicleLoan.find({ user: user._id }).limit(1);
  if (vlApplication) {
    const vlByIdRes = await fetch(`${BASE}/api/admin/vehicle-loans/${vlApplication._id}`, { headers: adminHeaders });
    const vlByIdBody = await vlByIdRes.json().catch(() => ({}));
    const vlByIdOk =
      vlByIdRes.status === 200 && vlByIdBody.data && vlByIdBody.data.vehicleType === "SUV";
    results.push({
    name: "ADMIN / get vehicle loan by id",
    status: vlByIdRes.status,
    ok: vlByIdOk,
    detail: vlByIdOk ? "" : JSON.stringify(vlByIdBody).slice(0, 200),
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
  const adminCpListRes = await fetch(`${BASE}/api/admin/commercial-purchases`, { headers: adminHeaders });
  const adminCpListBody = await adminCpListRes.json().catch(() => ({}));
  const adminCpListOk = adminCpListRes.status === 200 && Array.isArray(adminCpListBody.data);
  results.push({
    name: "ADMIN / list commercial purchases",
    status: adminCpListRes.status,
    ok: adminCpListOk,
    detail: adminCpListOk ? "" : JSON.stringify(adminCpListBody).slice(0, 200),
  });

  const [cpApplication] = await CommercialPurchase.find({ user: user._id }).limit(1);
  if (cpApplication) {
    const cpByIdRes = await fetch(`${BASE}/api/admin/commercial-purchases/${cpApplication._id}`, { headers: adminHeaders });
    const cpByIdBody = await cpByIdRes.json().catch(() => ({}));
    const cpByIdOk =
      cpByIdRes.status === 200 && cpByIdBody.data && cpByIdBody.data.buyingPropertyMarketValue === 6000000;
    results.push({
      name: "ADMIN / get commercial purchase by id",
      status: cpByIdRes.status,
      ok: cpByIdOk,
      detail: cpByIdOk ? "" : JSON.stringify(cpByIdBody).slice(0, 200),
    });
  }

  const adminWcListRes = await fetch(`${BASE}/api/admin/working-capitals`, { headers: adminHeaders });
  const adminWcListBody = await adminWcListRes.json().catch(() => ({}));
  const adminWcListOk = adminWcListRes.status === 200 && Array.isArray(adminWcListBody.data);
  results.push({
    name: "ADMIN / list working capitals",
    status: adminWcListRes.status,
    ok: adminWcListOk,
    detail: adminWcListOk ? "" : JSON.stringify(adminWcListBody).slice(0, 200),
  });

  const [wcApplication] = await WorkingCapital.find({ user: user._id }).limit(1);
  if (wcApplication) {
    const wcByIdRes = await fetch(`${BASE}/api/admin/working-capitals/${wcApplication._id}`, { headers: adminHeaders });
    const wcByIdBody = await wcByIdRes.json().catch(() => ({}));
    const wcByIdOk =
      wcByIdRes.status === 200 && wcByIdBody.data && wcByIdBody.data.collateralPropertyMarketValue === 5000000;
    results.push({
      name: "ADMIN / get working capital by id",
      status: wcByIdRes.status,
      ok: wcByIdOk,
      detail: wcByIdOk ? "" : JSON.stringify(wcByIdBody).slice(0, 200),
    });
  }

  const adminLrdListRes = await fetch(`${BASE}/api/admin/lease-rental-discountings`, { headers: adminHeaders });
  const adminLrdListBody = await adminLrdListRes.json().catch(() => ({}));
  const adminLrdListOk = adminLrdListRes.status === 200 && Array.isArray(adminLrdListBody.data);
  results.push({
    name: "ADMIN / list lease rental discountings",
    status: adminLrdListRes.status,
    ok: adminLrdListOk,
    detail: adminLrdListOk ? "" : JSON.stringify(adminLrdListBody).slice(0, 200),
  });

  const [lrdApplication] = await LeaseRentalDiscounting.find({ user: user._id }).limit(1);
  if (lrdApplication) {
    const lrdByIdRes = await fetch(`${BASE}/api/admin/lease-rental-discountings/${lrdApplication._id}`, { headers: adminHeaders });
    const lrdByIdBody = await lrdByIdRes.json().catch(() => ({}));
    const lrdByIdOk =
      lrdByIdRes.status === 200 && lrdByIdBody.data && lrdByIdBody.data.leasePropertyState === "Maharashtra";
    results.push({
      name: "ADMIN / get lease rental discounting by id",
      status: lrdByIdRes.status,
      ok: lrdByIdOk,
      detail: lrdByIdOk ? "" : JSON.stringify(lrdByIdBody).slice(0, 200),
    });
  }

  const adminOdListRes = await fetch(`${BASE}/api/admin/od-cc-limits`, { headers: adminHeaders });
  const adminOdListBody = await adminOdListRes.json().catch(() => ({}));
  const adminOdListOk = adminOdListRes.status === 200 && Array.isArray(adminOdListBody.data);
  results.push({
    name: "ADMIN / list OD / CC limits",
    status: adminOdListRes.status,
    ok: adminOdListOk,
    detail: adminOdListOk ? "" : JSON.stringify(adminOdListBody).slice(0, 200),
  });

  const [odApplication] = await OdCcLimit.find({ user: user._id }).limit(1);
  if (odApplication) {
    const odByIdRes = await fetch(`${BASE}/api/admin/od-cc-limits/${odApplication._id}`, { headers: adminHeaders });
    const odByIdBody = await odByIdRes.json().catch(() => ({}));
    const odByIdOk =
      odByIdRes.status === 200 && odByIdBody.data && odByIdBody.data.collateralPropertyMarketValue === 5000000;
    results.push({
      name: "ADMIN / get OD / CC limit by id",
      status: odByIdRes.status,
      ok: odByIdOk,
      detail: odByIdOk ? "" : JSON.stringify(odByIdBody).slice(0, 200),
    });
  }

  const adminFfListRes = await fetch(`${BASE}/api/admin/film-fundings`, { headers: adminHeaders });
  const adminFfListBody = await adminFfListRes.json().catch(() => ({}));
  const adminFfListOk = adminFfListRes.status === 200 && Array.isArray(adminFfListBody.data);
  results.push({
    name: "ADMIN / list film fundings",
    status: adminFfListRes.status,
    ok: adminFfListOk,
    detail: adminFfListOk ? "" : JSON.stringify(adminFfListBody).slice(0, 200),
  });

  const [ffApplication] = await FilmFunding.find({ user: user._id }).limit(1);
  if (ffApplication) {
    const ffByIdRes = await fetch(`${BASE}/api/admin/film-fundings/${ffApplication._id}`, { headers: adminHeaders });
    const ffByIdBody = await ffByIdRes.json().catch(() => ({}));
    const ffByIdOk =
      ffByIdRes.status === 200 &&
      ffByIdBody.data &&
      Boolean(ffByIdBody.data.filmComesUnder) &&
      Boolean(ffByIdBody.data.sections && ffByIdBody.data.sections.loanRequirements.totalProjectCost);
    results.push({
      name: "ADMIN / get film funding by id",
      status: ffByIdRes.status,
      ok: ffByIdOk,
      detail: ffByIdOk ? "" : JSON.stringify(ffByIdBody).slice(0, 200),
    });
  }

  const adminGoldListRes = await fetch(`${BASE}/api/admin/gold-loans`, { headers: adminHeaders });
  const adminGoldListBody = await adminGoldListRes.json().catch(() => ({}));
  const adminGoldListOk = adminGoldListRes.status === 200 && Array.isArray(adminGoldListBody.data);
  results.push({
    name: "ADMIN / list gold loans",
    status: adminGoldListRes.status,
    ok: adminGoldListOk,
    detail: adminGoldListOk ? "" : JSON.stringify(adminGoldListBody).slice(0, 200),
  });

  const [goldApplication] = await GoldLoan.find({ user: user._id }).limit(1);
  if (goldApplication) {
    const goldByIdRes = await fetch(`${BASE}/api/admin/gold-loans/${goldApplication._id}`, { headers: adminHeaders });
    const goldByIdBody = await goldByIdRes.json().catch(() => ({}));
    const goldByIdOk =
      goldByIdRes.status === 200 &&
      goldByIdBody.data &&
      Boolean(goldByIdBody.data.typeOfLoan) &&
      Boolean(goldByIdBody.data.sections && goldByIdBody.data.sections.loanRequirements.goldWeight);
    results.push({
      name: "ADMIN / get gold loan by id",
      status: goldByIdRes.status,
      ok: goldByIdOk,
      detail: goldByIdOk ? "" : JSON.stringify(goldByIdBody).slice(0, 200),
    });
  }

  const adminNpaListRes = await fetch(`${BASE}/api/admin/npa-loans`, { headers: adminHeaders });
  const adminNpaListBody = await adminNpaListRes.json().catch(() => ({}));
  const adminNpaListOk = adminNpaListRes.status === 200 && Array.isArray(adminNpaListBody.data);
  results.push({
    name: "ADMIN / list npa loans",
    status: adminNpaListRes.status,
    ok: adminNpaListOk,
    detail: adminNpaListOk ? "" : JSON.stringify(adminNpaListBody).slice(0, 200),
  });

  const [npaApplication] = await NpaLoan.find({ user: user._id }).limit(1);
  if (npaApplication) {
    const npaByIdRes = await fetch(`${BASE}/api/admin/npa-loans/${npaApplication._id}`, { headers: adminHeaders });
    const npaByIdBody = await npaByIdRes.json().catch(() => ({}));
    const npaByIdOk =
      npaByIdRes.status === 200 &&
      npaByIdBody.data &&
      Boolean(npaByIdBody.data.npaStatus) &&
      Boolean(npaByIdBody.data.sections && npaByIdBody.data.sections.loanRequirements.npaPrincipalLoanAmount);
    results.push({
      name: "ADMIN / get npa loan by id",
      status: npaByIdRes.status,
      ok: npaByIdOk,
      detail: npaByIdOk ? "" : JSON.stringify(npaByIdBody).slice(0, 200),
    });
  }

  const adminLasListRes = await fetch(`${BASE}/api/admin/loan-against-shares`, { headers: adminHeaders });
  const adminLasListBody = await adminLasListRes.json().catch(() => ({}));
  const adminLasListOk = adminLasListRes.status === 200 && Array.isArray(adminLasListBody.data);
  results.push({
    name: "ADMIN / list loan against shares",
    status: adminLasListRes.status,
    ok: adminLasListOk,
    detail: adminLasListOk ? "" : JSON.stringify(adminLasListBody).slice(0, 200),
  });

  const [lasApplication] = await LoanAgainstShare.find({ user: user._id }).limit(1);
  if (lasApplication) {
    const lasByIdRes = await fetch(`${BASE}/api/admin/loan-against-shares/${lasApplication._id}`, { headers: adminHeaders });
    const lasByIdBody = await lasByIdRes.json().catch(() => ({}));
    const lasByIdOk =
      lasByIdRes.status === 200 && lasByIdBody.data && lasByIdBody.data.shareCompanyName === "Reliance Industries";
    results.push({
      name: "ADMIN / get loan against share by id",
      status: lasByIdRes.status,
      ok: lasByIdOk,
      detail: lasByIdOk ? "" : JSON.stringify(lasByIdBody).slice(0, 200),
    });
  }

  const adminFdiListRes = await fetch(`${BASE}/api/admin/fdi-loans`, { headers: adminHeaders });
  const adminFdiListBody = await adminFdiListRes.json().catch(() => ({}));
  const adminFdiListOk = adminFdiListRes.status === 200 && Array.isArray(adminFdiListBody.data);
  results.push({
    name: "ADMIN / list FDI loans",
    status: adminFdiListRes.status,
    ok: adminFdiListOk,
    detail: adminFdiListOk ? "" : JSON.stringify(adminFdiListBody).slice(0, 200),
  });

  const [fdiApplication] = await FdiLoan.find({ user: user._id }).limit(1);
  if (fdiApplication) {
    const fdiByIdRes = await fetch(`${BASE}/api/admin/fdi-loans/${fdiApplication._id}`, { headers: adminHeaders });
    const fdiByIdBody = await fdiByIdRes.json().catch(() => ({}));
    const fdiByIdOk =
      fdiByIdRes.status === 200 &&
      fdiByIdBody.data &&
      fdiByIdBody.data.loanType === "FDI Loan" &&
      fdiByIdBody.data.collateralPropertyType === "Industrial Property";
    results.push({
      name: "ADMIN / get FDI loan by id",
      status: fdiByIdRes.status,
      ok: fdiByIdOk,
      detail: fdiByIdOk ? "" : JSON.stringify(fdiByIdBody).slice(0, 200),
    });
  }

  await HomeLoan.deleteMany({ user: user._id });
  await BusinessLoan.deleteMany({ user: user._id });
  await PersonalLoan.deleteMany({ user: user._id });
  await LoanAgainstProperty.deleteMany({ user: user._id });
  await BalanceTransfer.deleteMany({ user: user._id });
  await ProjectLoan.deleteMany({ user: user._id });
  await VehicleLoan.deleteMany({ user: user._id });
  await EducationLoan.deleteMany({ user: user._id });
  await CreditCard.deleteMany({ user: user._id });
  await CommercialPurchase.deleteMany({ user: user._id });
  await WorkingCapital.deleteMany({ user: user._id });
  await LeaseRentalDiscounting.deleteMany({ user: user._id });
  await OdCcLimit.deleteMany({ user: user._id });
  await LoanAgainstShare.deleteMany({ user: user._id });
  await FilmFunding.deleteMany({ user: user._id });
  await NpaLoan.deleteMany({ user: user._id });
  await GoldLoan.deleteMany({ user: user._id });
  await FdiLoan.deleteMany({ user: user._id });
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
