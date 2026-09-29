const vehicleLoanService = require("./vehicleLoan.service");

module.exports = {
  apply: vehicleLoanService.apply,
  list: vehicleLoanService.list,

  // Used by the admin application controller.
  sanitizeVehicleLoanResponse: vehicleLoanService.sanitize,
};
