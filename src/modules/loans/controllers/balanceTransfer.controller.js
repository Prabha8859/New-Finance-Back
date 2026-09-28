const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("balanceTransfer"),

  // Used by the admin application controller.
  sanitizeBalanceTransferResponse: (record) => sanitizeLoanResponse("balanceTransfer", record),
};
