const PersonalLoan = require("../models/PersonalLoan");

// Explicit allowlist — never spread req.body directly into a create(),
// otherwise a client could set server-controlled fields like `status`.
const APPLICATION_FIELDS = [
  "loanAmount",
  "loanTenure",
  "employmentType",
  "existingEMI",
  "existingLoanAmount",
  "existingBanks",
  "existingLoanTypes",
  "fullName",
  "mobile",
  "email",
  "dob",
  "panNumber",
  "state",
  "city",
  "pincode",
  "residenceStatus",
];

exports.apply = async (req, res, next) => {
  try {
    const loanData = { user: req.user.id };

    for (const field of APPLICATION_FIELDS) {
      if (req.body[field] !== undefined) loanData[field] = req.body[field];
    }

    const application = await PersonalLoan.create(loanData);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const applications = await PersonalLoan.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};
