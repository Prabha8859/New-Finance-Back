const router = require("express").Router();

const auth = require("../../../middleware/auth.middleware");
const controller = require("./loanAgainstProperty.controller");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./loanAgainstProperty.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
