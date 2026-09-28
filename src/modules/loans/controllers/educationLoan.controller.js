const { createLoanController, sanitizeLoanResponse } = require("../services/loan.service");

module.exports = {
  ...createLoanController("educationLoan"),

  // Used by the admin application controller.
  sanitizeEducationLoanResponse: (record) => sanitizeLoanResponse("educationLoan", record),
};
