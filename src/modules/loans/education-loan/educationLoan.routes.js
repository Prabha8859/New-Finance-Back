const router = require("express").Router();

const educationLoanController = require("./educationLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./educationLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, educationLoanController.apply);
router.get("/applications", auth, educationLoanController.list);

module.exports = router;
