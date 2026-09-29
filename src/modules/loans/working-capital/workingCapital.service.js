const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "workingCapital";

/*
Business logic for Working Capital.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "workingCapital" and is where any product-only rule belongs.
*/
const workingCapitalService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = workingCapitalService;
