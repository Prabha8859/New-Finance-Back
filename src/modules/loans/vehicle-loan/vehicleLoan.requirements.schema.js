/* =========================================================================
 * LOAN REQUIREMENTS · VEHICLE LOAN only
 * =========================================================================
 * Used when LOAN_PRODUCTS.vehicleLoan.loanRequirements === "vehicleLoan".
 *
 * The dashboard's vehicle fields are optional (labels have no * mark) — only
 * loanAmount + loanTenure are mandatory for a vehicle loan. When a value IS
 * sent it is still checked, and an "Other" pick needs its free-text partner.
 * ========================================================================= */

const vehicleLoanRequirementFields = {
  vehicleType: { type: String, trim: true },
  vehicleTypeOther: { type: String, trim: true },
  transmissionType: { type: String, trim: true },
  transmissionTypeOther: { type: String, trim: true },
  fuelType: { type: String, trim: true },
  fuelTypeOther: { type: String, trim: true },
  manufacturer: { type: String, trim: true },
  model: { type: String, trim: true },
  vehiclePurchaseType: { type: String, trim: true },
  vehiclePurchaseTypeOther: { type: String, trim: true },
};

module.exports = { vehicleLoanRequirementFields };
