/* =========================================================================
 * STEP 5 — Personal Details (same fields for every product)
 * =========================================================================
 * Personal Loan keeps these optional; the other products require them.
 * That switch is LOAN_PRODUCTS[].personalDetailsRequired.
 * ========================================================================= */

const personalDetailsFields = {
  fullName: { type: String, required: [true, "Full name is required"] },
  mobile: { type: String, required: [true, "Mobile number is required"] },
  email: String,
  dob: Date,
  panNumber: String,
  state: String,
  city: String,
  pincode: String,
  residenceStatus: String,
};

/** Same fields, all required — used when personalDetailsRequired is true. */
const requiredPersonalDetailsFields = {
  ...personalDetailsFields,
  email: { type: String, required: [true, "Email is required"] },
  dob: { type: Date, required: [true, "Date of birth is required"] },
  panNumber: { type: String, required: [true, "PAN number is required"] },
  state: { type: String, required: [true, "State is required"] },
  city: { type: String, required: [true, "City is required"] },
  pincode: { type: String, required: [true, "Pincode is required"] },
  residenceStatus: { type: String, required: [true, "Residence status is required"] },
};

const PERSONAL_DETAILS_FIELD_NAMES = Object.keys(requiredPersonalDetailsFields);

module.exports = {
  personalDetailsFields,
  requiredPersonalDetailsFields,
  PERSONAL_DETAILS_FIELD_NAMES,
};
