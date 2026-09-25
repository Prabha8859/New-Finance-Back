const HomeLoan = require("../models/HomeLoan");

const SENTINEL_TRANSACTION_BANK_VALUES = new Set(["Other", "Multiple Transaction Banks"]);

const normalizeTransactionBankNames = (selectedBanks, otherBankName) => {
  const normalized = [];

  const pushUnique = (rawValue) => {
    if (rawValue === undefined || rawValue === null) return;

    const values = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");

    values.forEach((item) => {
      const value = String(item ?? "").trim();
      if (!value) return;
      if (SENTINEL_TRANSACTION_BANK_VALUES.has(value)) return;

      const formatted = value.replace(/\s+/g, " ");
      const alreadyExists = normalized.some((existing) => existing.toLowerCase() === formatted.toLowerCase());
      if (!alreadyExists) normalized.push(formatted);
    });
  };

  pushUnique(selectedBanks);
  pushUnique(otherBankName);

  return normalized;
};

const COMMON_FIELDS = [
  "user", "loanType", "loanAmount", "loanTenure", "buyingPropertyType", "buyingPropertyTypeOther",
  "buyingPropertyAge", "buyingPropertyState", "buyingPropertyCity", "buyingPropertyPincode",
  "buyingPropertyPincodeOther", "employmentType", "existingEMI", "existingLoanAmount",
  "existingBanks", "otherBankList", "existingLoanTypes", "otherLoanList", "fullName",
  "mobile", "email", "dob", "panNumber", "state", "city", "pincode", "residenceStatus",
  "status", "createdAt", "updatedAt", "__v", "_id",
];

const SALARIED_FIELDS = [
  "companyName", "companyType", "companyTypeOther", "monthlySalary", "salaryReceivedAs",
  "salaryReceivedAsOther", "salaryBankName", "salaryBankOther",
];

const BUSINESS_FIELDS = [
  "businessType", "businessTypeOther", "businessName", "gstNumber", "companyPanNumber",
  "natureOfBusiness", "natureOfBusinessOther", "industryType", "industryTypeOther",
  "subIndustry", "businessEstablishedDate", "transactionBankName", "transactionBankOther",
  "lastYearTurnover", "last2YearsTurnover", "lastYearNetIncome", "last2YearsNetIncome",
  "businessState", "businessCity", "businessPincode", "businessPincodeOther",
  "businessPlaceStatus", "businessPlaceStatusOther",
];

const PROFESSIONAL_FIELDS = [
  "profession", "currentYearTurnover", "priorYearTurnover", "currentYearNetIncome",
  "previousYearNetIncome", "businessState", "businessCity", "businessPincode",
  "businessPincodeOther", "businessPlaceStatus", "businessPlaceStatusOther",
];

const FIELDS = [
  ...COMMON_FIELDS,
  ...SALARIED_FIELDS,
  ...BUSINESS_FIELDS,
  ...PROFESSIONAL_FIELDS,
];

const sanitizeEmploymentFields = (data) => {
  if (!data || typeof data !== "object") return data;
  const employmentType = String(data.employmentType || "");
  const allowed = new Set(COMMON_FIELDS);

  if (employmentType === "Salaried") {
    SALARIED_FIELDS.forEach((field) => allowed.add(field));
  } else if (employmentType === "Self Employed - Business") {
    BUSINESS_FIELDS.forEach((field) => allowed.add(field));
  } else if (employmentType === "Self Employed - Professional") {
    PROFESSIONAL_FIELDS.forEach((field) => allowed.add(field));
  }

  Object.keys(data).forEach((key) => {
    if (!allowed.has(key)) delete data[key];
  });

  return data;
};

const normalizeResponse = (record) => {
  const raw = record && typeof record.toObject === "function" ? record.toObject() : { ...record };
  return sanitizeEmploymentFields(raw);
};

exports.apply = async (req, res, next) => {
  try {
    const source = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    const data = { user: req.user.id, loanType: "Home Loan" };
    for (const field of FIELDS) if (source[field] !== undefined) data[field] = source[field];

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(data.businessEstablishedDate || ""))) {
      const [day, month, year] = data.businessEstablishedDate.split("/");
      data.businessEstablishedDate = `${year}-${month}-${day}`;
    }

    data.transactionBankName = normalizeTransactionBankNames(
      data.transactionBankName,
      data.transactionBankOther
    );

    sanitizeEmploymentFields(data);
    const application = await HomeLoan.create(data);
    res.status(201).json({ success: true, data: normalizeResponse(application) });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((item) => item.message),
      });
    }
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const applications = await HomeLoan.find({ user: req.user.id }).sort({ createdAt: -1 });
    const sanitized = applications.map((app) => normalizeResponse(app));
    res.json({ success: true, data: sanitized });
  } catch (error) {
    next(error);
  }
};
