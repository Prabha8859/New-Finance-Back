const router = require("express").Router();

const personalLoanController = require("../controllers/personalLoan.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/personalLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, personalLoanController.apply);
router.get("/applications", auth, personalLoanController.list);

module.exports = router;
