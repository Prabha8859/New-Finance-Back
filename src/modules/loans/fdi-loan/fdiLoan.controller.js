const fdiLoanService = require("./fdiLoan.service");

module.exports = {
  apply: fdiLoanService.apply,
  list: fdiLoanService.list,
  sanitizeFdiLoanResponse: fdiLoanService.sanitize,
};