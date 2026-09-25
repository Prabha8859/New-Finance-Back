const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");
const {
  personalDetailsFields,
  existingLoanExposureFields,
  requiredSalariedIncomeFields,
} = require("./schemas/loanSections");

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

    ...requiredSalariedIncomeFields,
    ...existingLoanExposureFields,
    ...personalDetailsFields,
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
