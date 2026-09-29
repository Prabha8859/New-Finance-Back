const router = require("express").Router();

const loanAgainstShareController = require("./loanAgainstShare.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./loanAgainstShare.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, loanAgainstShareController.apply);
router.get("/applications", auth, loanAgainstShareController.list);

module.exports = router;
