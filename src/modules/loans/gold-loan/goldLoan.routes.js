const router = require("express").Router();

const goldLoanController = require("./goldLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./goldLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, goldLoanController.apply);
router.get("/applications", auth, goldLoanController.list);

module.exports = router;
