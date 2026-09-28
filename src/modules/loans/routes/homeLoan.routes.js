const router = require("express").Router();
const auth = require("../../../shared/middleware/auth");
const controller = require("../controllers/homeLoan.controller");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/homeLoan.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
