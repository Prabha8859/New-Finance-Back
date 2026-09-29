const { buildApplyValidator } = require("../shared/loanValidator");

// LAP: collateral-property requirements + mandatory existing-loan exposure.
module.exports = { applyValidator: buildApplyValidator("lap") };
