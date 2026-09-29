const goldLoanService = require("./goldLoan.service");

module.exports = {
  apply: goldLoanService.apply,
  list: goldLoanService.list,

  // Used by the admin application controller.
  sanitizeGoldLoanResponse: goldLoanService.sanitize,
};
