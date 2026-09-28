const mongoose = require("mongoose");
const { buildLoanSchema } = require("../schema");

module.exports = mongoose.model("HomeLoan", buildLoanSchema("home"));
