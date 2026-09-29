const { buildApplyValidator } = require("../shared/loanValidator");

// OD / CC Limit: all three employment types, and it shares the LAP
// "collateralProperty" requirement section (see loanProducts.js).
module.exports = { applyValidator: buildApplyValidator("odCcLimit") };
