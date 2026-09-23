const router = require("express").Router();

const businessLoanController = require("../controllers/businessLoan.controller");
const auth = require("../middleware/auth");
const { applyValidator } = require("../middleware/validators/businessLoanValidators");

router.post("/apply", auth, applyValidator, businessLoanController.apply);
router.get("/applications", auth, businessLoanController.list);

module.exports = router;
