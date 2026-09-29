const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "leaseRentalDiscounting";

/*
Business logic for Lease Rental Discounting.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "leaseRentalDiscounting" and is where any product-only
rule belongs.
*/
const leaseRentalDiscountingService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = leaseRentalDiscountingService;
