const loanAgainstPropertyService = require("./loanAgainstProperty.service");

module.exports = {
  apply: loanAgainstPropertyService.apply,
  list: loanAgainstPropertyService.list,

  // Used by the admin application controller.
  sanitizeLoanAgainstPropertyResponse: loanAgainstPropertyService.sanitize,
};
