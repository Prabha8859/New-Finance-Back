const PersonalLoan = require("../../models/PersonalLoan");
const BusinessLoan = require("../../models/BusinessLoan");
const HomeLoan = require("../../models/HomeLoan");
const { sanitizeBusinessLoanResponse } = require("../businessLoan.controller");

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
