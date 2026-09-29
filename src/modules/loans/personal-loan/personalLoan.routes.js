const router = require("express").Router();

const personalLoanController = require("./personalLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./personalLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, personalLoanController.apply);
router.get("/applications", auth, personalLoanController.list);

module.exports = router;
