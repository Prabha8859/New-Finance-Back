const PersonalLoan = require("../loans/personal-loan/personalLoan.model");
const BusinessLoan = require("../loans/business-loan/businessLoan.model");
const HomeLoan = require("../loans/home-loan/homeLoan.model");
const LoanAgainstProperty = require("../loans/loan-against-property/loanAgainstProperty.model");
const BalanceTransfer = require("../loans/balance-transfer/balanceTransfer.model");
const { sanitizeBusinessLoanResponse } = require("../loans/business-loan/businessLoan.controller");
const { sanitizeLoanAgainstPropertyResponse } = require("../loans/loan-against-property/loanAgainstProperty.controller");
const { sanitizeBalanceTransferResponse } = require("../loans/balance-transfer/balanceTransfer.controller");
const ProjectLoan = require("../loans/project-loan/projectLoan.model");
const { sanitizeProjectLoanResponse } = require("../loans/project-loan/projectLoan.controller");
const VehicleLoan = require("../loans/vehicle-loan/vehicleLoan.model");
const { sanitizeVehicleLoanResponse } = require("../loans/vehicle-loan/vehicleLoan.controller");
const EducationLoan = require("../loans/education-loan/educationLoan.model");
const { sanitizeEducationLoanResponse } = require("../loans/education-loan/educationLoan.controller");
const CreditCard = require("../loans/credit-card/creditCard.model");
const { sanitizeCreditCardResponse } = require("../loans/credit-card/creditCard.controller");
const CommercialPurchase = require("../loans/commercial-purchase/commercialPurchase.model");
const { sanitizeCommercialPurchaseResponse } = require("../loans/commercial-purchase/commercialPurchase.controller");
const WorkingCapital = require("../loans/working-capital/workingCapital.model");
const { sanitizeWorkingCapitalResponse } = require("../loans/working-capital/workingCapital.controller");
const OdCcLimit = require("../loans/od-cc-limit/odCcLimit.model");
const { sanitizeOdCcLimitResponse } = require("../loans/od-cc-limit/odCcLimit.controller");
const LoanAgainstShare = require("../loans/loan-against-share/loanAgainstShare.model");
const { sanitizeLoanAgainstShareResponse } = require("../loans/loan-against-share/loanAgainstShare.controller");
const FilmFunding = require("../loans/film-funding/filmFunding.model");
const { sanitizeFilmFundingResponse } = require("../loans/film-funding/filmFunding.controller");
const NpaLoan = require("../loans/npa-loan/npaLoan.model");
const { sanitizeNpaLoanResponse } = require("../loans/npa-loan/npaLoan.controller");
const GoldLoan = require("../loans/gold-loan/goldLoan.model");
const { sanitizeGoldLoanResponse } = require("../loans/gold-loan/goldLoan.controller");

exports.listLoanAgainstShares = async (req, res, next) => {
  try {
    const applications = await LoanAgainstShare.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeLoanAgainstShareResponse(
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

exports.getLoanAgainstShareById = async (req, res, next) => {
  try {
    const application = await LoanAgainstShare.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Loan against share application not found",
      });
    }

    const sanitized = sanitizeLoanAgainstShareResponse(
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

exports.listFilmFundings = async (req, res, next) => {
  try {
    const applications = await FilmFunding.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeFilmFundingResponse(
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

exports.getFilmFundingById = async (req, res, next) => {
  try {
    const application = await FilmFunding.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Film funding application not found",
      });
    }

    const sanitized = sanitizeFilmFundingResponse(
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

exports.listNpaLoans = async (req, res, next) => {
  try {
    const applications = await NpaLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeNpaLoanResponse(
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

exports.getNpaLoanById = async (req, res, next) => {
  try {
    const application = await NpaLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "NPA loan application not found",
      });
    }

    const sanitized = sanitizeNpaLoanResponse(
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

exports.listGoldLoans = async (req, res, next) => {
  try {
    const applications = await GoldLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeGoldLoanResponse(
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

exports.getGoldLoanById = async (req, res, next) => {
  try {
    const application = await GoldLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Gold loan application not found",
      });
    }

    const sanitized = sanitizeGoldLoanResponse(
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

exports.listOdCcLimits = async (req, res, next) => {
  try {
    const applications = await OdCcLimit.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeOdCcLimitResponse(
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

exports.getOdCcLimitById = async (req, res, next) => {
  try {
    const application = await OdCcLimit.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "OD / CC limit application not found",
      });
    }

    const sanitized = sanitizeOdCcLimitResponse(
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
const LeaseRentalDiscounting = require("../loans/lease-rental-discounting/leaseRentalDiscounting.model");
const { sanitizeLeaseRentalDiscountingResponse } = require("../loans/lease-rental-discounting/leaseRentalDiscounting.controller");

exports.listLeaseRentalDiscountings = async (req, res, next) => {
  try {
    const applications = await LeaseRentalDiscounting.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeLeaseRentalDiscountingResponse(
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

exports.getLeaseRentalDiscountingById = async (req, res, next) => {
  try {
    const application = await LeaseRentalDiscounting.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Lease rental discounting application not found",
      });
    }

    const sanitized = sanitizeLeaseRentalDiscountingResponse(
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

exports.listWorkingCapitals = async (req, res, next) => {
  try {
    const applications = await WorkingCapital.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeWorkingCapitalResponse(
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

exports.getWorkingCapitalById = async (req, res, next) => {
  try {
    const application = await WorkingCapital.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Working capital application not found",
      });
    }

    const sanitized = sanitizeWorkingCapitalResponse(
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

exports.listCommercialPurchases = async (req, res, next) => {
  try {
    const applications = await CommercialPurchase.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeCommercialPurchaseResponse(
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

exports.getCommercialPurchaseById = async (req, res, next) => {
  try {
    const application = await CommercialPurchase.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Commercial purchase application not found",
      });
    }

    const sanitized = sanitizeCommercialPurchaseResponse(
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

exports.listVehicleLoans = async (req, res, next) => {
  try {
    const applications = await VehicleLoan.find().sort({ createdAt: -1 });
    const sanitized = applications.map((application) => sanitizeVehicleLoanResponse(
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

exports.getVehicleLoanById = async (req, res, next) => {
  try {
    const application = await VehicleLoan.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Vehicle loan application not found",
      });
    }

    const sanitized = sanitizeVehicleLoanResponse(
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
