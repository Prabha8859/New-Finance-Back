const { buildApplyValidator } = require("./index");

// Balance transfer: all three employment types, its own transfer requirements.
module.exports = { applyValidator: buildApplyValidator("balanceTransfer") };
