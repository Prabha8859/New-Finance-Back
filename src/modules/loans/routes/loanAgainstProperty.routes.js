const router = require("express").Router();

const auth = require("../../../shared/middleware/auth");
const controller = require("../controllers/loanAgainstProperty.controller");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/loanAgainstProperty.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
