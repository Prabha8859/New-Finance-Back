const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("lap"),

  // Used by the admin application controller.
  sanitizeLoanAgainstPropertyResponse: (record) => sanitizeLoanResponse("lap", record),
};
