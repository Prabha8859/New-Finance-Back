const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");
const {
  businessIncomeFields,
  existingLoanExposureFields,
  requiredPersonalDetailsFields,
} = require("./schemas/loanSections");

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

    ...businessIncomeFields,
    ...existingLoanExposureFields,
    ...requiredPersonalDetailsFields,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Submitted"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessLoan", businessLoanSchema);
