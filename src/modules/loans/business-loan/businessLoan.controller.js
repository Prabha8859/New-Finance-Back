const businessLoanService = require("./businessLoan.service");

module.exports = {
  apply: businessLoanService.apply,
  list: businessLoanService.list,

  // Used by the admin application controller.
  sanitizeBusinessLoanResponse: businessLoanService.sanitize,

  // Bank helpers are also used by the admin application controller.
  normalizeTransactionBankNames: businessLoanService.normalizeTransactionBankNames,
};
