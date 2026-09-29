const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");
const { normalizeTransactionBanks } = require("../../../utils/transactionBanks");

/* Product key used in LOAN_PRODUCTS and the MODELS map (../shared/loanProducts.js). */
const PRODUCT_KEY = "business";

/*
Business logic for Business Loan.
Every loan product shares ONE engine (../shared/loan.service.js) — this file
binds that engine to "business" and is where any product-only rule belongs.
*/
const businessLoanService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
  normalizeTransactionBankNames: normalizeTransactionBanks,
};

module.exports = businessLoanService;
