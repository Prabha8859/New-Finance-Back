const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");
const {
  collateralPropertyFields,
  employmentIncomeFields,
  existingLoanExposureFields,
  requiredPersonalDetailsFields,
} = require("./schemas/loanSections");

const loanAgainstPropertySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    loanType: { type: String, enum: ["Loan Against Property"], default: "Loan Against Property" },
    loanAmount: { type: Number, required: [true, "Loan amount is required"] },
    loanTenure: { type: Number, required: [true, "Loan tenure is required"] },

    // Section: Loan Requirements (collateral being mortgaged)
    ...collateralPropertyFields,

    // Section: Income Details
    employmentType: { type: String, enum: EMPLOYMENT_TYPES.lap, required: true },
    ...employmentIncomeFields,

    // Section: Existing Loan Exposure
    ...existingLoanExposureFields,

    // Section: Personal Details
    ...requiredPersonalDetailsFields,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Submitted"],
      default: "Submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoanAgainstProperty", loanAgainstPropertySchema);
