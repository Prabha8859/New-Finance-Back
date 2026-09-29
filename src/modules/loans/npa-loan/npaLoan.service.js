const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "npaLoan";

/*
Business logic for NPA Loan.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "npaLoan" and is where any product-only rule belongs.
*/
const npaLoanService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = npaLoanService;
