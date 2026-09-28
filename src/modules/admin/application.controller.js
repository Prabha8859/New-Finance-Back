const PersonalLoan = require("../loans/models/personalLoan.model");
const BusinessLoan = require("../loans/models/businessLoan.model");
const HomeLoan = require("../loans/models/homeLoan.model");
const LoanAgainstProperty = require("../loans/models/loanAgainstProperty.model");
const BalanceTransfer = require("../loans/models/balanceTransfer.model");
const { sanitizeBusinessLoanResponse } = require("../loans/controllers/businessLoan.controller");
const { sanitizeLoanAgainstPropertyResponse } = require("../loans/controllers/loanAgainstProperty.controller");
const { sanitizeBalanceTransferResponse } = require("../loans/controllers/balanceTransfer.controller");
const ProjectLoan = require("../loans/models/projectLoan.model");
const { sanitizeProjectLoanResponse } = require("../loans/controllers/projectLoan.controller");
const CarLoan = require("../loans/models/carLoan.model");
const { sanitizeCarLoanResponse } = require("../loans/controllers/carLoan.controller");
const EducationLoan = require("../loans/models/educationLoan.model");
const { sanitizeEducationLoanResponse } = require("../loans/controllers/educationLoan.controller");
const CreditCard = require("../loans/models/creditCard.model");
const { sanitizeCreditCardResponse } = require("../loans/controllers/creditCard.controller");

exports.listHomeLoans = async (req, res, next) => {
  try {
    const applications = await HomeLoan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

exports.getHomeLoanById = async (req, res, next) => {
  try {
    const application = await HomeLoan.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Home loan application not found" });
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

exports.listLoanAgainstProperties = async (req, res, next) => {
  try {
    const applications = await LoanAgainstProperty.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeLoanAgainstPropertyResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoanAgainstPropertyById = async (req, res, next) => {
  try {
    const application = await LoanAgainstProperty.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Loan against property application not found",
      });
    }

    const sanitized = sanitizeLoanAgainstPropertyResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listPersonalLoans = async (req, res, next) => {
  try {
    const applications = await PersonalLoan.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPersonalLoanById = async (req, res, next) => {
  try {
    const application = await PersonalLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Personal loan application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

exports.listBusinessLoans = async (req, res, next) => {
  try {
    const applications = await BusinessLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeBusinessLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listCarLoans = async (req, res, next) => {
  try {
    const applications = await CarLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeCarLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCarLoanById = async (req, res, next) => {
  try {
    const application = await CarLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Car loan application not found",
      });
    }

    const sanitized = sanitizeCarLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listEducationLoans = async (req, res, next) => {
  try {
    const applications = await EducationLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeEducationLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEducationLoanById = async (req, res, next) => {
  try {
    const application = await EducationLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Education loan application not found",
      });
    }

    const sanitized = sanitizeEducationLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listCreditCards = async (req, res, next) => {
  try {
    const applications = await CreditCard.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeCreditCardResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCreditCardById = async (req, res, next) => {
  try {
    const application = await CreditCard.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Credit card application not found",
      });
    }

    const sanitized = sanitizeCreditCardResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listBalanceTransfers = async (req, res, next) => {
  try {
    const applications = await BalanceTransfer.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeBalanceTransferResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBalanceTransferById = async (req, res, next) => {
  try {
    const application = await BalanceTransfer.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Balance transfer application not found",
      });
    }

    const sanitized = sanitizeBalanceTransferResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.listProjectLoans = async (req, res, next) => {
  try {
    const applications = await ProjectLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeProjectLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    ));

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectLoanById = async (req, res, next) => {
  try {
    const application = await ProjectLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Project loan application not found",
      });
    }

    const sanitized = sanitizeProjectLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBusinessLoanById = async (req, res, next) => {
  try {
    const application = await BusinessLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Business loan application not found",
      });
    }

    const sanitized = sanitizeBusinessLoanResponse(
      application && typeof application.toObject === "function" ? application.toObject() : application
    );

    res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    next(error);
  }
};
