const leaseRentalDiscountingService = require("./leaseRentalDiscounting.service");

module.exports = {
  apply: leaseRentalDiscountingService.apply,
  list: leaseRentalDiscountingService.list,

  // Used by the admin application controller.
  sanitizeLeaseRentalDiscountingResponse: leaseRentalDiscountingService.sanitize,
};
