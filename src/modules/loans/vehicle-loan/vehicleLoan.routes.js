const router = require("express").Router();

const vehicleLoanController = require("./vehicleLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./vehicleLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, vehicleLoanController.apply);
router.get("/applications", auth, vehicleLoanController.list);

module.exports = router;
