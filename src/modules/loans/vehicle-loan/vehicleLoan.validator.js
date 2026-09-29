const { buildApplyValidator } = require("../shared/loanValidator");

// Vehicle loan: all three employment types, its own vehicle requirements.
module.exports = { applyValidator: buildApplyValidator("vehicleLoan") };
