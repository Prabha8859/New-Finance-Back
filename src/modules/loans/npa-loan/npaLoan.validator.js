const { buildApplyValidator } = require("../shared/loanValidator");

// NPA Loan: all three employment types, its own NPA details requirements.
module.exports = { applyValidator: buildApplyValidator("npaLoan") };
