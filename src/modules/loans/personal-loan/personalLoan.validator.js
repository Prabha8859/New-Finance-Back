const { buildApplyValidator } = require("../shared/loanValidator");

// Personal loan: salaried income only, personal details are optional.
module.exports = { applyValidator: buildApplyValidator("personal") };
