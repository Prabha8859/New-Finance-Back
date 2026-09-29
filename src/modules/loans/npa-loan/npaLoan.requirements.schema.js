/*
=========================================================================
LOAN REQUIREMENTS · NPA LOAN only
=========================================================================
Used when LOAN_PRODUCTS.npaLoan.loanRequirements === "npaLoan".

An NPA (Non-Performing Asset) loan application is about an EXISTING stressed
account, not about borrowing fresh money. So this product has NO loanAmount /
loanTenure (the config sets loanAmountRequired:false, loanTenureRequired:false
— same pattern as Credit Card).

npaStatus has a dashboard dropdown with an "Other" option, so the free-text
partner field (npaStatusOther) travels with it and merges on save — same
pattern as every "Other" selector in the app.
=========================================================================
*/

const npaLoanRequirementFields = {
  npaStatus: {
    type: String,
    trim: true,
    required: [true, "NPA status is required"],
  },
  npaStatusOther: { type: String, trim: true },
  npaPrincipalLoanAmount: {
    type: Number,
    min: 0,
    required: [true, "NPA principal loan amount is required"],
  },
  npaCurrentOutstandingAmount: {
    type: Number,
    min: 0,
    required: [true, "NPA current outstanding amount is required"],
  },
};

module.exports = { npaLoanRequirementFields };
