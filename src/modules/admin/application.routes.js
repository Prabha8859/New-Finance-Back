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

router.get("/car-loans", applicationController.listCarLoans);
router.get("/car-loans/:id", applicationController.getCarLoanById);

router.get("/education-loans", applicationController.listEducationLoans);
router.get("/education-loans/:id", applicationController.getEducationLoanById);

router.get("/credit-cards", applicationController.listCreditCards);
router.get("/credit-cards/:id", applicationController.getCreditCardById);

module.exports = router;
