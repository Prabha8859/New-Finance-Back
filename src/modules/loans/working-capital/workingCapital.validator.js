const { buildApplyValidator } = require("../shared/loanValidator");

// Working Capital: all three employment types, and it shares the LAP
// "collateralProperty" requirement section (see loanProducts.js).
module.exports = { applyValidator: buildApplyValidator("workingCapital") };
