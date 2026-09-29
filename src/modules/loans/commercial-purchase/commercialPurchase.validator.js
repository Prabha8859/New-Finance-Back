const { buildApplyValidator } = require("../shared/loanValidator");

// Commercial Purchase: all three employment types, its own commercial-property requirements.
module.exports = { applyValidator: buildApplyValidator("commercialPurchase") };
