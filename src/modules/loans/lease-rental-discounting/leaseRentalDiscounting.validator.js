const { buildApplyValidator } = require("../shared/loanValidator");

// Lease Rental Discounting: all three employment types, its own lease-property requirements.
module.exports = { applyValidator: buildApplyValidator("leaseRentalDiscounting") };
