const mongoose = require("mongoose");
const { buildLoanSchema } = require("../shared/loanSchema");

module.exports = mongoose.model("FdiLoan", buildLoanSchema("fdiLoan"));