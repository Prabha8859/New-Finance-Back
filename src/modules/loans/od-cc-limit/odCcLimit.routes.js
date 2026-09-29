const router = require("express").Router();

const odCcLimitController = require("./odCcLimit.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./odCcLimit.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, odCcLimitController.apply);
router.get("/applications", auth, odCcLimitController.list);

module.exports = router;
