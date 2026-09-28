const router = require("express").Router();

const projectLoanController = require("../controllers/projectLoan.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/projectLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, projectLoanController.apply);
router.get("/applications", auth, projectLoanController.list);

module.exports = router;
