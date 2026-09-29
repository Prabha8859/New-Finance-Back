/*
=========================================================================
LOAN REQUIREMENTS · COMMERCIAL PURCHASE only
=========================================================================
Used when LOAN_PRODUCTS.commercialPurchase.loanRequirements === "commercialPurchase".

Same "buying property" shape as Home Loan, plus buyingPropertyMarketValue
(a commercial property's market value is needed for the LTV check).
=========================================================================
*/

const commercialPurchaseRequirementFields = {
  buyingPropertyType: { type: String, trim: true },
  buyingPropertyTypeOther: String,
  buyingPropertyMarketValue: Number,
  buyingPropertyAge: Number,
  buyingPropertyState: { type: String, trim: true },
  buyingPropertyCity: { type: String, trim: true },
  buyingPropertyPincode: { type: String, trim: true },
  buyingPropertyPincodeOther: String,
};

module.exports = { commercialPurchaseRequirementFields };
