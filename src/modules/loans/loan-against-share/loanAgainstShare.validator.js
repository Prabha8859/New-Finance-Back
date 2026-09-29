const { buildApplyValidator } = require("../shared/loanValidator");

// Loan Against Share: all three employment types, its own share requirements.
module.exports = { applyValidator: buildApplyValidator("loanAgainstShare") };
