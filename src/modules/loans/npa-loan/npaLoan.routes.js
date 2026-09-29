const router = require("express").Router();

const npaLoanController = require("./npaLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./npaLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, npaLoanController.apply);
router.get("/applications", auth, npaLoanController.list);

module.exports = router;
