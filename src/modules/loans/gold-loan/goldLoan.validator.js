const { buildApplyValidator } = require("../shared/loanValidator");

// Gold Loan: all three employment types, its own gold requirements.
module.exports = { applyValidator: buildApplyValidator("goldLoan") };
