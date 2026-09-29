const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "commercialPurchase";

/*
Business logic for Commercial Purchase.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "commercialPurchase" and is where any product-only rule belongs.
*/
const commercialPurchaseService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = commercialPurchaseService;
