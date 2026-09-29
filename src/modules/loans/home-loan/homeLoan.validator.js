const { buildApplyValidator } = require("../shared/loanValidator");

// Employment types, shared sections and the buying-property requirements all
// come from LOAN_PRODUCTS.home — see ../shared/loanProducts.js.
module.exports = { applyValidator: buildApplyValidator("home") };
