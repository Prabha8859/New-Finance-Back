const balanceTransferService = require("./balanceTransfer.service");

module.exports = {
  apply: balanceTransferService.apply,
  list: balanceTransferService.list,

  // Used by the admin application controller.
  sanitizeBalanceTransferResponse: balanceTransferService.sanitize,
};
