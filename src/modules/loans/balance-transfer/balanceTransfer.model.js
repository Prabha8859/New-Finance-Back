const mongoose = require("mongoose");
const { buildLoanSchema } = require("../shared/loanSchema");

module.exports = mongoose.model("BalanceTransfer", buildLoanSchema("balanceTransfer"));
