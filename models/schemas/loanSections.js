const mongoose = require("mongoose");
const { requiredFor, requiredForSalaryBank } = require("../../utils/employmentTypeRules");

const requiredForSelfEmployed = function () {
  return ["Self Employed - Business", "Self Employed - Professional"].includes(this.employmentType);
};

const personalDetailsFields = {
  fullName: { type: String, required: [true, "Full name is required"] },
  mobile: { type: String, required: [true, "Mobile number is required"] },
  email: String,
  dob: Date,
  panNumber: String,
  state: String,
  city: String,
  pincode: String,
  residenceStatus: String,
};

const requiredPersonalDetailsFields = {
  ...personalDetailsFields,
  email: { type: String, required: [true, "Email is required"] },
  dob: { type: Date, required: [true, "Date of birth is required"] },
  panNumber: { type: String, required: [true, "PAN number is required"] },
  state: { type: String, required: [true, "State is required"] },
  city: { type: String, required: [true, "City is required"] },
  pincode: { type: String, required: [true, "Pincode is required"] },
  residenceStatus: { type: String, required: [true, "Residence status is required"] },
};

const existingLoanExposureFields = {
  existingEMI: { type: Number, default: 0 },
  existingLoanAmount: { type: Number, default: 0 },
  existingBanks: { type: [String], default: [] },
  otherBankList: { type: [String], default: [] },
  existingLoanTypes: { type: [String], default: [] },
  otherLoanList: { type: [String], default: [] },
};

const salariedIncomeFields = {
  companyName: String,
  companyType: String,
  companyTypeOther: String,
  monthlySalary: Number,
  salaryReceivedAs: String,
  salaryReceivedAsOther: String,
  salaryBankName: String,
  salaryBankOther: String,
};

const requiredSalariedIncomeFields = {
  ...salariedIncomeFields,
  companyName: { type: String, required: requiredFor("Salaried") },
  companyType: { type: String, required: requiredFor("Salaried") },
  monthlySalary: { type: Number, required: requiredFor("Salaried") },
  salaryReceivedAs: { type: String, required: requiredFor("Salaried") },
  salaryBankName: { type: String, required: requiredForSalaryBank },
};

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

/** Collateral / mortgaged property details (Loan Against Property). */
const collateralPropertyFields = {
  collateralPropertyType: {
    type: String,
    trim: true,
    required: [true, "Please select what you wish to take the loan against"],
  },
  collateralPropertyTypeOther: { type: String, trim: true },
  collateralPropertyMarketValue: {
    type: Number,
    required: [true, "Collateral property market value is required"],
  },
  collateralPropertyAge: {
    type: Number,
    required: [true, "Collateral property age is required"],
  },
  collateralPropertyState: {
    type: String,
    trim: true,
    required: [true, "Collateral property state is required"],
  },
  collateralPropertyCity: {
    type: String,
    trim: true,
    required: [true, "Collateral property city is required"],
  },
  collateralPropertyPincode: {
    type: String,
    trim: true,
    required: [true, "Collateral property pincode is required"],
  },
  collateralPropertyPincodeOther: { type: String, trim: true },
};

/** Income fields shared by every product that supports all employment types. */
const employmentIncomeFields = {
  ...salariedIncomeFields,
  ...businessIncomeFields,
  companyName: { type: String, required: requiredFor("Salaried") },
  companyType: { type: String, required: requiredFor("Salaried") },
  monthlySalary: { type: Number, required: requiredFor("Salaried") },
  salaryReceivedAs: { type: String, required: requiredFor("Salaried") },
  salaryBankName: { type: String, required: requiredForSalaryBank },
  currentYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  priorYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  currentYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  previousYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Professional" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Professional"),
  },
  lastYearTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsTurnover: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
  },
  lastYearNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
    required: requiredFor("Self Employed - Business"),
  },
  last2YearsNetIncome: {
    type: Number,
    default: function () {
      return this.employmentType === "Self Employed - Business" ? 0 : undefined;
    },
  },
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
  businessPlaceStatus: {
    type: String,
    trim: true,
    required: requiredForSelfEmployed,
  },
};

module.exports = {
  personalDetailsFields,
  requiredPersonalDetailsFields,
  existingLoanExposureFields,
  salariedIncomeFields,
  requiredSalariedIncomeFields,
  businessIncomeFields,
  collateralPropertyFields,
  employmentIncomeFields,
};
