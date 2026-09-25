const router = require("express").Router();

const personalLoanController = require("../controllers/personalLoan.controller");
const auth = require("../middleware/auth");
const normalizeApplyPayload = require("../middleware/normalizeApplyPayload");
const { applyValidator } = require("../middleware/validators/personalLoanValidators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, personalLoanController.apply);
router.get("/applications", auth, personalLoanController.list);

module.exports = router;
