const PersonalLoan = require("../models/PersonalLoan");

const APPLICATION_FIELDS = [
  "loanType",
  "loanAmount",
  "loanTenure",
  "employmentType",
  "companyName",
  "companyType",
  "companyTypeOther",
  "monthlySalary",
  "salaryReceivedAs",
  "salaryReceivedAsOther",
  "salaryBankName",
  "salaryBankOther",
  "existingEMI",
  "existingLoanAmount",
  "existingBanks",
  "otherBankList",
  "existingLoanTypes",
  "otherLoanList",
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

    // Validate "Other" conditional fields before saving.
    if (rawBody.companyType === "Other" && (!rawBody.companyTypeOther || !String(rawBody.companyTypeOther).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please mention company type",
      });
    }

    if (rawBody.salaryReceivedAs === "Other" && (!rawBody.salaryReceivedAsOther || !String(rawBody.salaryReceivedAsOther).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please mention salary received as",
      });
    }

    if (rawBody.salaryBankName === "Other" && (!rawBody.salaryBankOther || !String(rawBody.salaryBankOther).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please mention bank name",
      });
    }

    for (const field of APPLICATION_FIELDS) {
      if (rawBody[field] !== undefined) loanData[field] = rawBody[field];
    }

    // Normalize string values used in the salaried form.
    if (loanData.companyName) loanData.companyName = String(loanData.companyName).trim();
    if (loanData.companyType) loanData.companyType = String(loanData.companyType).trim();
    if (loanData.companyTypeOther) loanData.companyTypeOther = String(loanData.companyTypeOther).trim();
    if (loanData.salaryReceivedAs) loanData.salaryReceivedAs = String(loanData.salaryReceivedAs).trim();
    if (loanData.salaryReceivedAsOther) loanData.salaryReceivedAsOther = String(loanData.salaryReceivedAsOther).trim();
    if (loanData.salaryBankName) loanData.salaryBankName = String(loanData.salaryBankName).trim();
    if (loanData.salaryBankOther) loanData.salaryBankOther = String(loanData.salaryBankOther).trim();

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
