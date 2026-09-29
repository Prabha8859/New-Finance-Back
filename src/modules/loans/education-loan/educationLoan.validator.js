const { buildApplyValidator } = require("../shared/loanValidator");

// Education loan: all three employment types, its own education requirements.
module.exports = { applyValidator: buildApplyValidator("educationLoan") };
