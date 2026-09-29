const projectLoanService = require("./projectLoan.service");

module.exports = {
  apply: projectLoanService.apply,
  list: projectLoanService.list,

  // Used by the admin application controller.
  sanitizeProjectLoanResponse: projectLoanService.sanitize,
};
