const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("carLoan"),

  // Used by the admin application controller.
  sanitizeCarLoanResponse: (record) => sanitizeLoanResponse("carLoan", record),
};
