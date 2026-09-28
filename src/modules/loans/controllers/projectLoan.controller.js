const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("projectLoan"),

  // Used by the admin application controller.
  sanitizeProjectLoanResponse: (record) => sanitizeLoanResponse("projectLoan", record),
};
