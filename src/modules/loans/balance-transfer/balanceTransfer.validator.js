const { buildApplyValidator } = require("../shared/loanValidator");

// Balance transfer: all three employment types, its own transfer requirements.
module.exports = { applyValidator: buildApplyValidator("balanceTransfer") };
