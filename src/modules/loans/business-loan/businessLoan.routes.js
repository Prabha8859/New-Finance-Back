const router = require("express").Router();

const businessLoanController = require("./businessLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./businessLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, businessLoanController.apply);
router.get("/applications", auth, businessLoanController.list);

module.exports = router;
