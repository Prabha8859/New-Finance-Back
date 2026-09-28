const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");
const { normalizeTransactionBanks } = require("../../../shared/utils/transactionBanks");

module.exports = {
  ...createLoanController("business"),

  // Bank helpers are also used by the admin application controller.
  normalizeTransactionBankNames: normalizeTransactionBanks,
  sanitizeBusinessLoanResponse: (record) => sanitizeLoanResponse("business", record),
};
