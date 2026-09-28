const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("creditCard"),

  // Used by the admin application controller.
  sanitizeCreditCardResponse: (record) => sanitizeLoanResponse("creditCard", record),
};
