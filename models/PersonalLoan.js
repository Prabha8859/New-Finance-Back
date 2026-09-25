const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");

const personalLoanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    loanType: {
      type: String,
      enum: ["Personal Loan", "Business Loan", "Home Loan", "Car Loan", "Education Loan", "Other"],
      default: "Personal Loan",
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
      enum: EMPLOYMENT_TYPES.personal,
      default: "Salaried",
    },

    companyName: String,
    companyType: String,
    companyTypeOther: String,
    monthlySalary: Number,
    salaryReceivedAs: String,
    salaryReceivedAsOther: String,
    salaryBankName: String,
    salaryBankOther: String,

    existingEMI: {
      type: Number,
      default: 0,
    },
    existingLoanAmount: {
      type: Number,
      default: 0,
    },
    existingBanks: [String],
    otherBankList: [String],
    existingLoanTypes: [String],
    otherLoanList: [String],

    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
    },
    email: String,
    dob: Date,
    panNumber: String,
    state: String,
    city: String,
    pincode: String,
    residenceStatus: String,
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Submitted"],
      default: "Submitted",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PersonalLoan", personalLoanSchema);
