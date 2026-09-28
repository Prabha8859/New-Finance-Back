const { buildApplyValidator } = require("./index");

// Employment types, shared sections and the buying-property requirements all
// come from LOAN_PRODUCTS.home — see constants/loanProducts.js.
module.exports = { applyValidator: buildApplyValidator("home") };
