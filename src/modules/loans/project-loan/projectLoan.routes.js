const router = require("express").Router();

const projectLoanController = require("./projectLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./projectLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, projectLoanController.apply);
router.get("/applications", auth, projectLoanController.list);

module.exports = router;
