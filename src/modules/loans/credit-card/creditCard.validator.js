const { buildApplyValidator } = require("../shared/loanValidator");

// Credit card: all three employment types, its own card details (no amount/tenure).
module.exports = { applyValidator: buildApplyValidator("creditCard") };
