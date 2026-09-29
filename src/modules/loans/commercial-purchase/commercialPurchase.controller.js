const commercialPurchaseService = require("./commercialPurchase.service");

module.exports = {
  apply: commercialPurchaseService.apply,
  list: commercialPurchaseService.list,

  // Used by the admin application controller.
  sanitizeCommercialPurchaseResponse: commercialPurchaseService.sanitize,
};
