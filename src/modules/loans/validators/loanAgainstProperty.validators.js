const { buildApplyValidator } = require("./index");

// LAP: collateral-property requirements + mandatory existing-loan exposure.
module.exports = { applyValidator: buildApplyValidator("lap") };
