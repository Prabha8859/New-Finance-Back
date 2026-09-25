const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");

const normalizeLoanType = (value) => String(value ?? "").trim().toLowerCase();

exports.list = (req, res) => {
  const loanType = normalizeLoanType(req.params.loanType || req.query.loanType);
  const types = EMPLOYMENT_TYPES[loanType];

  if (!types) {
    return res.status(400).json({
      success: false,
      message: "Unsupported loanType",
      supportedLoanTypes: Object.keys(EMPLOYMENT_TYPES),
    });
  }

  return res.json({
    success: true,
    data: {
      loanType,
      employmentTypes: types,
    },
  });
};
