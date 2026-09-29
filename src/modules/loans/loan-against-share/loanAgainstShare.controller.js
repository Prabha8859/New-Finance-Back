const loanAgainstShareService = require("./loanAgainstShare.service");

module.exports = {
  apply: loanAgainstShareService.apply,
  list: loanAgainstShareService.list,

  // Used by the admin application controller.
  sanitizeLoanAgainstShareResponse: loanAgainstShareService.sanitize,
};
