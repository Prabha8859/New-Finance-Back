const router = require("express").Router();

const controller = require("./fdiLoan.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const normalizeFdiTenure = require("./fdiLoan.tenure.middleware");
const { applyValidator } = require("./fdiLoan.validator");

router.post("/apply", auth, normalizeFdiTenure, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;