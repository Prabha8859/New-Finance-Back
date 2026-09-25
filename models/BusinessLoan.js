const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");

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
      enum: EMPLOYMENT_TYPES.business,
    },

    businessType: {
      type: String,
      trim: true,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    businessTypeOther: {
      type: String,
      trim: true,
    },

    businessName: {
      type: String,
      trim: true,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    gstNumber: {
      type: String,
      trim: true,
    },

    companyPanNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    natureOfBusiness: {
      type: String,
      trim: true,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    natureOfBusinessOther: {
      type: String,
      trim: true,
    },

    industryType: {
      type: String,
      trim: true,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    industryTypeOther: {
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
      required: function () {
        return this.employmentType === "Self Employed - Professional";
      },
    },

    businessEstablishedDate: {
      type: Date,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    transactionBankName: {
      type: String,
      trim: true,
    },

    transactionBankOther: {
      type: String,
      trim: true,
    },

    currentYearTurnover: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Professional";
      },
    },

    priorYearTurnover: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Professional";
      },
    },

    currentYearNetIncome: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Professional";
      },
    },

    previousYearNetIncome: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Professional";
      },
    },

    lastYearTurnover: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    last2YearsTurnover: {
      type: Number,
      default: 0,
    },

    lastYearNetIncome: {
      type: Number,
      default: 0,
      required: function () {
        return this.employmentType === "Self Employed - Business";
      },
    },

    last2YearsNetIncome: {
      type: Number,
      default: 0,
    },

    businessState: {
      type: String,
      trim: true,
      required: true,
    },

    businessCity: {
      type: String,
      trim: true,
      required: true,
    },

    businessPincode: {
      type: String,
      trim: true,
      required: true,
    },

    businessPlaceStatus: {
      type: String,
      trim: true,
      required: true,
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
