const PersonalLoan = require("../../models/PersonalLoan");
const BusinessLoan = require("../../models/BusinessLoan");

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
    res.status(200).json({
      success: true,
      data: applications,
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

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
