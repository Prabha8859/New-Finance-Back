
const homeLoanRequirementFields = {
  buyingPropertyType: { type: String, trim: true },
  buyingPropertyTypeOther: String,
  buyingPropertyAge: Number,
  buyingPropertyState: { type: String, trim: true },
  buyingPropertyCity: { type: String, trim: true },
  buyingPropertyPincode: { type: String, trim: true },
  buyingPropertyPincodeOther: String,
};

module.exports = { homeLoanRequirementFields };
