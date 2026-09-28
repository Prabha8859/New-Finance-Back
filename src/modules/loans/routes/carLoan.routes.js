const router = require("express").Router();

const carLoanController = require("../controllers/carLoan.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/carLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, carLoanController.apply);
router.get("/applications", auth, carLoanController.list);

module.exports = router;
