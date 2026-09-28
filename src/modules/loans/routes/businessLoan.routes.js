const router = require("express").Router();

const businessLoanController = require("../controllers/businessLoan.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/businessLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, businessLoanController.apply);
router.get("/applications", auth, businessLoanController.list);

module.exports = router;
