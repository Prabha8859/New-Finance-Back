const router = require("express").Router();

const applicationController = require("../../controllers/admin/application.controller");

router.get("/personal-loans", applicationController.listPersonalLoans);
router.get("/personal-loans/:id", applicationController.getPersonalLoanById);

router.get("/business-loans", applicationController.listBusinessLoans);
router.get("/business-loans/:id", applicationController.getBusinessLoanById);

module.exports = router;
