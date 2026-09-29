const personalLoanService = require("./personalLoan.service");

module.exports = {
  apply: personalLoanService.apply,
  list: personalLoanService.list,
};
