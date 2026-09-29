const npaLoanService = require("./npaLoan.service");

module.exports = {
  apply: npaLoanService.apply,
  list: npaLoanService.list,

  // Used by the admin application controller.
  sanitizeNpaLoanResponse: npaLoanService.sanitize,
};
