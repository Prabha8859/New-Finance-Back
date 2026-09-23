const router = require("express").Router();

const personalLoanController = require("../controllers/personalLoan.controller");
const auth = require("../middleware/auth");
const { applyValidator } = require("../middleware/validators/personalLoanValidators");

router.post("/apply", auth, applyValidator, personalLoanController.apply);
router.get("/applications", auth, personalLoanController.list);

module.exports = router;
