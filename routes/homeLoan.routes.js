const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/homeLoan.controller");
const { applyValidator } = require("../middleware/validators/homeLoanValidators");

router.post("/apply", auth, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
