/*
=========================================================================
LOAN REQUIREMENTS · LEASE RENTAL DISCOUNTING only
=========================================================================
Used when LOAN_PRODUCTS.leaseRentalDiscounting.loanRequirements ===
"leaseRentalDiscounting".

The leased property's location is mandatory — that is the property the rent
is discounted against. The lease income / value numbers are optional, so a
half-filled form can still be saved step by step.
=========================================================================
*/

const leaseRentalDiscountingRequirementFields = {
  monthlyLeaseIncome: Number,
  totalLeaseAmount: Number,
  leasePropertyDuration: Number,
  leasePropertyMarketValue: Number,
  leasePropertyAge: Number,
  leasePropertyState: {
    type: String,
    trim: true,
    required: [true, "Lease property state is required"],
  },
  leasePropertyCity: {
    type: String,
    trim: true,
    required: [true, "Lease property city is required"],
  },
  leasePropertyPincode: {
    type: String,
    trim: true,
    required: [true, "Lease property pincode is required"],
  },
  leasePropertyPincodeOther: { type: String, trim: true },
};

module.exports = { leaseRentalDiscountingRequirementFields };
