const mongoose = require("mongoose");

const personalLoanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanAmount: {
      type: Number,
      required: [true, "Loan amount is required"],
    },
    loanTenure: {
      type: Number,
      required: [true, "Loan tenure is required"],
    },
    employmentType: String,
    existingEMI: {
      type: Number,
      default: 0,
    },
    existingLoanAmount: {
      type: Number,
      default: 0,
    },
    existingBanks: [String],
    existingLoanTypes: [String],
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
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PersonalLoan", personalLoanSchema);
