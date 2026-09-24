const mongoose = require("mongoose");

const businessLoanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    loanType: {
      type: String,
      enum: ["Business Loan"],
      default: "Business Loan",
    },

    loanAmount: {
      type: Number,
      required: [true, "Loan amount is required"],
    },

    loanTenure: {
      type: Number,
      required: [true, "Loan tenure is required"],
    },

    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      enum: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
    },

    businessType: {
      type: String,
      trim: true,
    },

    businessName: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
    },

    companyPanNumber: {
      type: String,
      trim: true,
    },

    natureOfBusiness: {
      type: String,
      trim: true,
    },

    industryType: {
      type: String,
      trim: true,
    },

    subIndustry: {
      type: String,
      trim: true,
    },

    profession: {
      type: String,
      trim: true,
    },

    businessEstablishedDate: {
      type: Date,
    },

    transactionBankName: {
      type: String,
      trim: true,
    },

    currentYearTurnover: {
      type: Number,
      default: 0,
    },

    priorYearTurnover: {
      type: Number,
      default: 0,
    },

    currentYearNetIncome: {
      type: Number,
      default: 0,
    },

    previousYearNetIncome: {
      type: Number,
      default: 0,
    },

    lastYearTurnover: {
      type: Number,
      default: 0,
    },

    last2YearsTurnover: {
      type: Number,
      default: 0,
    },

    lastYearNetIncome: {
      type: Number,
      default: 0,
    },

    last2YearsNetIncome: {
      type: Number,
      default: 0,
    },

    businessState: {
      type: String,
      trim: true,
    },

    businessCity: {
      type: String,
      trim: true,
    },

    businessPincode: {
      type: String,
      trim: true,
    },

    businessPlaceStatus: {
      type: String,
      trim: true,
    },

    existingEMI: {
      type: Number,
      default: 0,
    },

    existingLoanAmount: {
      type: Number,
      default: 0,
    },

    existingBanks: {
      type: [String],
      default: [],
    },

    existingLoanTypes: {
      type: [String],
      default: [],
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
    },

    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    panNumber: {
      type: String,
      required: [true, "PAN number is required"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },

    residenceStatus: {
      type: String,
      required: [true, "Residence status is required"],
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Submitted"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessLoan", businessLoanSchema);
