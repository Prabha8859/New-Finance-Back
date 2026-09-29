const homeLoanService = require("./homeLoan.service");

module.exports = {
  apply: homeLoanService.apply,
  list: homeLoanService.list,
};
