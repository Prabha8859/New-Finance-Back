const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "projectLoan";

/*
Business logic for Project Loan.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "projectLoan" and is where any product-only rule belongs.
*/
const projectLoanService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = projectLoanService;
