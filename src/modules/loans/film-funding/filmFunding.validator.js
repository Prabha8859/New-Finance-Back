const { buildApplyValidator } = require("../shared/loanValidator");

// Film Funding: all three employment types, its own film requirements.
module.exports = { applyValidator: buildApplyValidator("filmFunding") };
