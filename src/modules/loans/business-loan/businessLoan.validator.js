const { buildApplyValidator } = require("../shared/loanValidator");

// Business loan has no extra "Loan Requirements" section — only the shared
// income / exposure / personal-details rules apply.
module.exports = { applyValidator: buildApplyValidator("business") };
