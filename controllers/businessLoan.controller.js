const BusinessLoan = require("../models/BusinessLoan");

const APPLICATION_FIELDS = [
  "loanType",
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
    const rawBody =
      req.body?.data && typeof req.body.data === "object" && !Array.isArray(req.body.data)
        ? req.body.data
        : req.body;

    const loanData = { user: req.user.id };

    for (const field of APPLICATION_FIELDS) {
      if (rawBody[field] !== undefined) loanData[field] = rawBody[field];
    }

    if (!loanData.loanType) {
      loanData.loanType = "Business Loan";
    }

    const application = await BusinessLoan.create(loanData);

    return res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const applications = await BusinessLoan.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};
