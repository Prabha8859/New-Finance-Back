const { buildApplyValidator } = require("./index");

// Education loan: all three employment types, its own education requirements.
module.exports = { applyValidator: buildApplyValidator("educationLoan") };
