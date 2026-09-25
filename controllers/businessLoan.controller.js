const BusinessLoan = require("../models/BusinessLoan");

const SENTINEL_TRANSACTION_BANK_VALUES = new Set(["Other", "Multiple Transaction Banks"]);
const PROFESSIONAL_ONLY_FIELDS = [
  "profession",
  "currentYearTurnover",
  "priorYearTurnover",
  "currentYearNetIncome",
  "previousYearNetIncome",
];

const BUSINESS_ONLY_FIELDS = [
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
  "businessEstablishedDate",
  "lastYearTurnover",
  "last2YearsTurnover",
  "lastYearNetIncome",
  "last2YearsNetIncome",
];

const sanitizeEmploymentSpecificFields = (data) => {
  if (!data || typeof data !== "object") return data;

  const employmentType = typeof data.employmentType === "string" ? data.employmentType.trim() : data.employmentType;

  if (employmentType === "Self Employed - Business") {
    PROFESSIONAL_ONLY_FIELDS.forEach((field) => {
      delete data[field];
    });
  }

  if (employmentType === "Self Employed - Professional") {
    BUSINESS_ONLY_FIELDS.forEach((field) => {
      delete data[field];
    });
  }

  return data;
};

const buildTransactionBankDisplayName = (bankNames, existingDisplayName) => {
  if (existingDisplayName && String(existingDisplayName).trim()) return String(existingDisplayName).trim();
  if (!Array.isArray(bankNames) || bankNames.length === 0) return undefined;
  return bankNames.length > 1 ? "Multiple Transaction Banks" : bankNames[0];
};

const normalizeTransactionBankObject = (bankList, fallbackDisplayName) => {
  const banks = [];

  const pushUnique = (rawValue) => {
    if (rawValue === undefined || rawValue === null) return;

    const values = Array.isArray(rawValue) ? rawValue : String(rawValue).split(",");
    values.forEach((item) => {
      const value = String(item ?? "").trim();
      if (!value || SENTINEL_TRANSACTION_BANK_VALUES.has(value)) return;

      const formatted = value.replace(/\s+/g, " ");
      const alreadyExists = banks.some((existing) => existing.toLowerCase() === formatted.toLowerCase());
      if (!alreadyExists) banks.push(formatted);
    });
  };

  if (Array.isArray(bankList)) {
    pushUnique(bankList);
  } else if (bankList && typeof bankList === "object") {
    pushUnique(bankList.banks);
    if (!fallbackDisplayName && bankList.displayName) {
      fallbackDisplayName = String(bankList.displayName).trim();
    }
  } else {
    pushUnique(bankList);
  }

  const displayName = fallbackDisplayName && String(fallbackDisplayName).trim()
    ? String(fallbackDisplayName).trim()
    : banks.length > 1
      ? "Multiple Transaction Banks"
      : banks.length === 1
        ? banks[0]
        : undefined;

  return {
    displayName,
    banks,
  };
};

const sanitizeBusinessLoanResponse = (record) => {
  if (!record || typeof record !== "object") return record;

  const data = Array.isArray(record)
    ? record.map((item) => sanitizeBusinessLoanResponse(item))
    : { ...record };

  sanitizeEmploymentSpecificFields(data);

  const existingDisplayName = data.transactionBankDisplayName || (data.transactionBankName && typeof data.transactionBankName === "object" && data.transactionBankName.displayName);

  if (data.transactionBankName !== undefined && data.transactionBankName !== null) {
    data.transactionBankName = normalizeTransactionBankObject(
      data.transactionBankName,
      existingDisplayName
    );
  }

  delete data.transactionBankDisplayName;
  return data;
};

const normalizeTransactionBankNames = (selectedBanks, otherBankName, existingDisplayName) => {
  const bankPayload = normalizeTransactionBankObject(
    selectedBanks,
    existingDisplayName
  );

  if (otherBankName !== undefined && otherBankName !== null && String(otherBankName).trim()) {
    const otherEntry = String(otherBankName).trim();
    if (!bankPayload.banks.some((bank) => bank.toLowerCase() === otherEntry.toLowerCase())) {
      bankPayload.banks.push(otherEntry);
    }
  }

  bankPayload.displayName = undefined;
  if (bankPayload.banks.length > 1) {
    bankPayload.displayName = "Multiple Transaction Banks";
  } else if (bankPayload.banks.length === 1) {
    bankPayload.displayName = bankPayload.banks[0];
  }

  return bankPayload;
};

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
  "transactionBankDisplayName",
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
  "businessPincodeOther",
  "businessPlaceStatus",
  "businessPlaceStatusOther",
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

    for (const field of APPLICATION_FIELDS) {
      if (rawBody[field] !== undefined) loanData[field] = rawBody[field];
    }

    if (!loanData.loanType) {
      loanData.loanType = "Business Loan";
    }

    const employmentType = typeof loanData.employmentType === "string" ? loanData.employmentType.trim() : loanData.employmentType;
    if (employmentType === "Self Employed - Business") {
      PROFESSIONAL_ONLY_FIELDS.forEach((field) => {
        delete loanData[field];
      });
    }
    if (employmentType === "Self Employed - Professional") {
      BUSINESS_ONLY_FIELDS.forEach((field) => {
        delete loanData[field];
      });
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

    ["businessType", "businessTypeOther", "businessName", "gstNumber", "companyPanNumber", "natureOfBusiness", "natureOfBusinessOther", "industryType", "industryTypeOther", "subIndustry", "profession", "transactionBankName", "transactionBankOther", "businessState", "businessCity", "businessPincode", "businessPincodeOther", "businessPlaceStatus", "businessPlaceStatusOther", "fullName", "mobile", "email", "panNumber", "state", "city", "pincode", "residenceStatus"].forEach((field) => {
      if (typeof loanData[field] === "string") {
        loanData[field] = loanData[field].trim();
      }
    });

    ["existingBanks", "otherBankList", "existingLoanTypes", "otherLoanList"].forEach((field) => {
      if (loanData[field] === undefined) return;
      if (typeof loanData[field] === "string") {
        loanData[field] = loanData[field].split(",").map((item) => item.trim()).filter(Boolean);
      }
      if (!Array.isArray(loanData[field])) {
        loanData[field] = [loanData[field]];
      }
    });

    loanData.transactionBankName = normalizeTransactionBankNames(
      loanData.transactionBankName,
      loanData.transactionBankOther,
      loanData.transactionBankDisplayName
    );

    delete loanData.transactionBankDisplayName;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(loanData.businessEstablishedDate || ""))) {
      const [day, month, year] = loanData.businessEstablishedDate.split("/");
      loanData.businessEstablishedDate = `${year}-${month}-${day}`;
    }

    const application = await BusinessLoan.create(loanData);
    const sanitized = sanitizeBusinessLoanResponse(application.toObject ? application.toObject() : application);

    return res.status(201).json({
      success: true,
      data: sanitized,
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
    const sanitized = applications.map((application) => sanitizeBusinessLoanResponse(
      application.toObject ? application.toObject() : application
    ));

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.normalizeTransactionBankNames = normalizeTransactionBankNames;
module.exports.sanitizeBusinessLoanResponse = sanitizeBusinessLoanResponse;
