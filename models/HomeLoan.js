const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");
const {
  requiredPersonalDetailsFields,
  existingLoanExposureFields,
  homeIncomeFields,
} = require("./schemas/loanSections");

const homeLoanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    loanType: { type: String, enum: ["Home Loan"], default: "Home Loan" },
    loanAmount: { type: Number, required: [true, "Loan amount is required"] },
    loanTenure: { type: Number, required: [true, "Loan tenure is required"] },

    buyingPropertyType: { type: String, required: [true, "Buying property type is required"] },
    buyingPropertyTypeOther: String,
    buyingPropertyAge: { type: Number, required: [true, "Buying property age is required"] },
    buyingPropertyState: { type: String, required: [true, "Buying property state is required"] },
    buyingPropertyCity: { type: String, required: [true, "Buying property city is required"] },
    buyingPropertyPincode: { type: String, required: [true, "Buying property pincode is required"] },
    buyingPropertyPincodeOther: String,

    employmentType: { type: String, enum: EMPLOYMENT_TYPES.home, required: true },
    ...homeIncomeFields,
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

module.exports = mongoose.model("HomeLoan", homeLoanSchema);
