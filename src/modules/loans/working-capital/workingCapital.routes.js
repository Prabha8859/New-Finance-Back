const router = require("express").Router();

const workingCapitalController = require("./workingCapital.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./workingCapital.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, workingCapitalController.apply);
router.get("/applications", auth, workingCapitalController.list);

module.exports = router;
