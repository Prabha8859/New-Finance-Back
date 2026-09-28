const mongoose = require("mongoose");
const { buildLoanSchema } = require("../schema");

module.exports = mongoose.model("CarLoan", buildLoanSchema("carLoan"));
