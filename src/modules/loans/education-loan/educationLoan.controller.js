const educationLoanService = require("./educationLoan.service");

module.exports = {
  apply: educationLoanService.apply,
  list: educationLoanService.list,

  // Used by the admin application controller.
  sanitizeEducationLoanResponse: educationLoanService.sanitize,
};
