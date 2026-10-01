const { buildApplyValidator } = require("../shared/loanValidator");

module.exports = { applyValidator: buildApplyValidator("fdiLoan") };