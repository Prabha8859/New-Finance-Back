const router = require("express").Router();

const applicationController = require("./application.controller");

router.get("/personal-loans", applicationController.listPersonalLoans);
router.get("/personal-loans/:id", applicationController.getPersonalLoanById);

router.get("/business-loans", applicationController.listBusinessLoans);
router.get("/business-loans/:id", applicationController.getBusinessLoanById);

router.get("/home-loans", applicationController.listHomeLoans);
router.get("/home-loans/:id", applicationController.getHomeLoanById);

router.get("/loan-against-properties", applicationController.listLoanAgainstProperties);
router.get("/loan-against-properties/:id", applicationController.getLoanAgainstPropertyById);

router.get("/balance-transfers", applicationController.listBalanceTransfers);
router.get("/balance-transfers/:id", applicationController.getBalanceTransferById);

router.get("/project-loans", applicationController.listProjectLoans);
router.get("/project-loans/:id", applicationController.getProjectLoanById);

router.get("/vehicle-loans", applicationController.listVehicleLoans);
router.get("/vehicle-loans/:id", applicationController.getVehicleLoanById);

router.get("/education-loans", applicationController.listEducationLoans);
router.get("/education-loans/:id", applicationController.getEducationLoanById);

router.get("/credit-cards", applicationController.listCreditCards);
router.get("/credit-cards/:id", applicationController.getCreditCardById);

router.get("/commercial-purchases", applicationController.listCommercialPurchases);
router.get("/commercial-purchases/:id", applicationController.getCommercialPurchaseById);

router.get("/working-capitals", applicationController.listWorkingCapitals);
router.get("/working-capitals/:id", applicationController.getWorkingCapitalById);

router.get("/od-cc-limits", applicationController.listOdCcLimits);
router.get("/od-cc-limits/:id", applicationController.getOdCcLimitById);

router.get("/gold-loans", applicationController.listGoldLoans);
router.get("/gold-loans/:id", applicationController.getGoldLoanById);

router.get("/npa-loans", applicationController.listNpaLoans);
router.get("/npa-loans/:id", applicationController.getNpaLoanById);

router.get("/film-fundings", applicationController.listFilmFundings);
router.get("/film-fundings/:id", applicationController.getFilmFundingById);

router.get("/loan-against-shares", applicationController.listLoanAgainstShares);
router.get("/loan-against-shares/:id", applicationController.getLoanAgainstShareById);

router.get("/lease-rental-discountings", applicationController.listLeaseRentalDiscountings);
router.get("/lease-rental-discountings/:id", applicationController.getLeaseRentalDiscountingById);

module.exports = router;
