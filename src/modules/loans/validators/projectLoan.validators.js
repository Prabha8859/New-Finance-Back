const { buildApplyValidator } = require("./index");

// Project loan: all three employment types, its own project requirements.
module.exports = { applyValidator: buildApplyValidator("projectLoan") };
