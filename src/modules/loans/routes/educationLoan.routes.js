const router = require("express").Router();

const educationLoanController = require("../controllers/educationLoan.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/educationLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, educationLoanController.apply);
router.get("/applications", auth, educationLoanController.list);

module.exports = router;
