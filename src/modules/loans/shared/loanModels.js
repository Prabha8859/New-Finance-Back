const PersonalLoan = require("../personal-loan/personalLoan.model");
const BusinessLoan = require("../business-loan/businessLoan.model");
const HomeLoan = require("../home-loan/homeLoan.model");
const CommercialPurchase = require("../commercial-purchase/commercialPurchase.model");
const LoanAgainstProperty = require("../loan-against-property/loanAgainstProperty.model");
const WorkingCapital = require("../working-capital/workingCapital.model");
const OdCcLimit = require("../od-cc-limit/odCcLimit.model");
const LeaseRentalDiscounting = require("../lease-rental-discounting/leaseRentalDiscounting.model");
const LoanAgainstShare = require("../loan-against-share/loanAgainstShare.model");
const FilmFunding = require("../film-funding/filmFunding.model");
const NpaLoan = require("../npa-loan/npaLoan.model");
const GoldLoan = require("../gold-loan/goldLoan.model");
const BalanceTransfer = require("../balance-transfer/balanceTransfer.model");
const ProjectLoan = require("../project-loan/projectLoan.model");
const VehicleLoan = require("../vehicle-loan/vehicleLoan.model");
const EducationLoan = require("../education-loan/educationLoan.model");
const CreditCard = require("../credit-card/creditCard.model");

/*
==========================================
Every loan collection in one leaf module — required by the shared loan
engine AND the admin endpoints, so both always address the same models.

Kept import-free of other shared modules (a LEAF) — importing loan.service
from here would recreate the circular-dependency bug where MODELS comes
back undefined depending on which module loads first.
==========================================
*/
const MODELS = {
  personal: PersonalLoan,
  business: BusinessLoan,
  home: HomeLoan,
  commercialPurchase: CommercialPurchase,
  lap: LoanAgainstProperty,
  workingCapital: WorkingCapital,
  odCcLimit: OdCcLimit,
  leaseRentalDiscounting: LeaseRentalDiscounting,
  loanAgainstShare: LoanAgainstShare,
  filmFunding: FilmFunding,
  npaLoan: NpaLoan,
  goldLoan: GoldLoan,
  balanceTransfer: BalanceTransfer,
  projectLoan: ProjectLoan,
  vehicleLoan: VehicleLoan,
  educationLoan: EducationLoan,
  creditCard: CreditCard,
};

module.exports = { MODELS };
