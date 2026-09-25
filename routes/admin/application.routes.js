const router = require("express").Router();

const applicationController = require("../../controllers/admin/application.controller");

router.get("/personal-loans", applicationController.listPersonalLoans);
router.get("/personal-loans/:id", applicationController.getPersonalLoanById);

router.get("/business-loans", applicationController.listBusinessLoans);
router.get("/business-loans/:id", applicationController.getBusinessLoanById);

router.get("/home-loans", applicationController.listHomeLoans);
router.get("/home-loans/:id", applicationController.getHomeLoanById);

router.get("/loan-against-properties", applicationController.listLoanAgainstProperties);
router.get("/loan-against-properties/:id", applicationController.getLoanAgainstPropertyById);

module.exports = router;
