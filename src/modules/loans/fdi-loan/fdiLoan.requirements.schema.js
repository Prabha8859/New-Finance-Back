/* =========================================================================
 * LOAN REQUIREMENTS · FDI LOAN only
 * =========================================================================
 * Collateral details for the FDI fund application form.
 * ========================================================================= */

const fdiLoanRequirementFields = {
  collateralPropertyType: {
    type: String,
    trim: true,
    required: [true, "Please select what you wish to take the fund against"],
  },
  collateralPropertyTypeOther: { type: String, trim: true },
  collateralPropertyMarketValue: {
    type: Number,
    min: 1,
    required: [true, "Collateral market value is required"],
  },
  collateralPropertyAge: {
    type: Number,
    min: 0,
    required: [true, "Collateral age is required"],
  },
  collateralPropertyState: {
    type: String,
    trim: true,
    required: [true, "Collateral state is required"],
  },
  collateralPropertyCity: {
    type: String,
    trim: true,
    required: [true, "Collateral city is required"],
  },
  collateralPropertyPincode: {
    type: String,
    trim: true,
    required: [true, "Collateral pincode is required"],
  },
  collateralPropertyPincodeOther: { type: String, trim: true },
};

module.exports = { fdiLoanRequirementFields };