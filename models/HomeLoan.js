const mongoose = require("mongoose");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");
const {
  requiredPersonalDetailsFields,
  existingLoanExposureFields,
  employmentIncomeFields,
} = require("./schemas/loanSections");

const homeLoanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    loanType: { type: String, enum: ["Home Loan"], default: "Home Loan" },
    loanAmount: { type: Number, required: [true, "Loan amount is required"] },
    loanTenure: { type: Number, required: [true, "Loan tenure is required"] },

    // Optional: the dashboard quick form does not collect buying-property details,
    // the detailed form does. Validated at the API layer when supplied.
    buyingPropertyType: { type: String, trim: true },
    buyingPropertyTypeOther: String,
    buyingPropertyAge: Number,
    buyingPropertyState: { type: String, trim: true },
    buyingPropertyCity: { type: String, trim: true },
    buyingPropertyPincode: { type: String, trim: true },
    buyingPropertyPincodeOther: String,

    employmentType: { type: String, enum: EMPLOYMENT_TYPES.home, required: true },
    ...employmentIncomeFields,
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
