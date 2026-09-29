/* =========================================================================
 * LOAN REQUIREMENTS · LOAN AGAINST PROPERTY only
 * =========================================================================
 * Used when LOAN_PRODUCTS.lap.loanRequirements === "collateralProperty".
 * Every field here is required — a LAP application is always against a property.
 * ========================================================================= */

const lapRequirementFields = {
  collateralPropertyType: {
    type: String,
    trim: true,
    required: [true, "Please select what you wish to take the loan against"],
  },
  collateralPropertyTypeOther: { type: String, trim: true },
  collateralPropertyMarketValue: {
    type: Number,
    required: [true, "Collateral property market value is required"],
  },
  collateralPropertyAge: {
    type: Number,
    required: [true, "Collateral property age is required"],
  },
  collateralPropertyState: {
    type: String,
    trim: true,
    required: [true, "Collateral property state is required"],
  },
  collateralPropertyCity: {
    type: String,
    trim: true,
    required: [true, "Collateral property city is required"],
  },
  collateralPropertyPincode: {
    type: String,
    trim: true,
    required: [true, "Collateral property pincode is required"],
  },
  collateralPropertyPincodeOther: { type: String, trim: true },
};

module.exports = { lapRequirementFields };
