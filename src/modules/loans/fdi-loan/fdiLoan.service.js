const {
  createLoanController,
  sanitizeLoanResponse,
} = require("../shared/loan.service");

const PRODUCT_KEY = "fdiLoan";

const fdiLoanService = {
  ...createLoanController(PRODUCT_KEY),
  sanitize: (record) => sanitizeLoanResponse(PRODUCT_KEY, record),
};

module.exports = fdiLoanService;