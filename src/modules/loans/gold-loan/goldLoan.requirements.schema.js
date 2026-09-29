/*
=========================================================================
LOAN REQUIREMENTS · GOLD LOAN only
=========================================================================
Used when LOAN_PRODUCTS.goldLoan.loanRequirements === "goldLoan".

A gold loan is secured by the pledged gold itself, so the form of the gold
(typeOfLoan), its purity (goldCarats), its weight (goldWeight) and its current
market value are all mandatory.

The market value reuses the LAP-family field name `collateralPropertyMarketValue`
(the gold IS the collateral). Only ONE requirement section is active per
product, so this name never conflicts with the LAP section.

`typeOfLoan` (Jewellery / Coin / Bar / Other) and `goldCarats` (18 / 22 / 24 /
Other) both have an "Other" option — their free-text partners (typeOfLoanOther,
goldCaratsOther) merge on save, the same as every "Other" selector in the app.
=========================================================================
*/

const goldLoanRequirementFields = {
  typeOfLoan: {
    type: String,
    trim: true,
    required: [true, "Type of loan is required"],
  },
  typeOfLoanOther: { type: String, trim: true },
  goldCarats: {
    type: String,
    trim: true,
    required: [true, "Gold karat is required"],
  },
  goldCaratsOther: { type: String, trim: true },
  goldWeight: {
    type: Number,
    min: 1,
    required: [true, "Gold weight is required"],
  },
  collateralPropertyMarketValue: {
    type: Number,
    min: 0,
    required: [true, "Current gold market value is required"],
  },
};

module.exports = { goldLoanRequirementFields };
