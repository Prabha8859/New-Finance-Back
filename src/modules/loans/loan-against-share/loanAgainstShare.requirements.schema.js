/*
=========================================================================
LOAN REQUIREMENTS · LOAN AGAINST SHARE only
=========================================================================
Used when LOAN_PRODUCTS.loanAgainstShare.loanRequirements === "loanAgainstShare".

A loan against shares is secured by the shares themselves, so the company,
the per-share value and the quantity are all mandatory.

`totalShareValue` is the dashboard's read-only total (value x quantity). It is
accepted when the form sends it, but it is never required.
=========================================================================
*/

const loanAgainstShareRequirementFields = {
  shareCompanyName: {
    type: String,
    trim: true,
    required: [true, "Share company name is required"],
  },
  valueOfOneShare: {
    type: Number,
    required: [true, "Value of one share is required"],
  },
  quantityOfShare: {
    type: Number,
    required: [true, "Quantity of share is required"],
  },
  totalShareValue: Number,
};

module.exports = { loanAgainstShareRequirementFields };
