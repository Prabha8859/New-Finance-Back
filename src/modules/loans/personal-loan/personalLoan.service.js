const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "personal";

/*
Business logic for Personal Loan.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "personal" and is where any product-only rule belongs.
*/
const personalLoanService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = personalLoanService;
