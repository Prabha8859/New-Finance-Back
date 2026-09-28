const { buildApplyValidator } = require("./index");

// Car loan: all three employment types, its own vehicle requirements.
module.exports = { applyValidator: buildApplyValidator("carLoan") };
