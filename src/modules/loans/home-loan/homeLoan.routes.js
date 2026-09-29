const router = require("express").Router();
const auth = require("../../../middleware/auth.middleware");
const controller = require("./homeLoan.controller");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./homeLoan.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
