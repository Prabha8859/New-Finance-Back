const BusinessLoan = require("../models/BusinessLoan");

const APPLICATION_FIELDS = [
  "loanType",
  "loanAmount",
  "loanTenure",
  "employmentType",
  "businessType",
  "businessTypeOther",
  "businessName",
  "gstNumber",
  "companyPanNumber",
  "natureOfBusiness",
  "natureOfBusinessOther",
  "industryType",
  "industryTypeOther",
  "subIndustry",
  "profession",
  "businessEstablishedDate",
  "transactionBankName",
  "transactionBankOther",
  "currentYearTurnover",
  "priorYearTurnover",
  "currentYearNetIncome",
  "previousYearNetIncome",
  "lastYearTurnover",
  "last2YearsTurnover",
  "lastYearNetIncome",
  "last2YearsNetIncome",
  "businessState",
  "businessCity",
  "businessPincode",
  "businessPlaceStatus",
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

    if (loanData.currentYearTurnover !== undefined && loanData.lastYearTurnover === undefined) {
      loanData.lastYearTurnover = loanData.currentYearTurnover;
    }
    if (loanData.priorYearTurnover !== undefined && loanData.last2YearsTurnover === undefined) {
      loanData.last2YearsTurnover = loanData.priorYearTurnover;
    }
    if (loanData.currentYearNetIncome !== undefined && loanData.lastYearNetIncome === undefined) {
      loanData.lastYearNetIncome = loanData.currentYearNetIncome;
    }
    if (loanData.previousYearNetIncome !== undefined && loanData.last2YearsNetIncome === undefined) {
      loanData.last2YearsNetIncome = loanData.previousYearNetIncome;
    }

    ["businessType", "businessTypeOther", "businessName", "gstNumber", "companyPanNumber", "natureOfBusiness", "natureOfBusinessOther", "industryType", "industryTypeOther", "subIndustry", "profession", "transactionBankName", "transactionBankOther", "businessState", "businessCity", "businessPincode", "businessPlaceStatus", "fullName", "mobile", "email", "panNumber", "state", "city", "pincode", "residenceStatus"].forEach((field) => {
      if (typeof loanData[field] === "string") {
        loanData[field] = loanData[field].trim();
      }
    });

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(loanData.businessEstablishedDate || ""))) {
      const [day, month, year] = loanData.businessEstablishedDate.split("/");
      loanData.businessEstablishedDate = `${year}-${month}-${day}`;
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
