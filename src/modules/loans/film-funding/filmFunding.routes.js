const router = require("express").Router();

const filmFundingController = require("./filmFunding.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./filmFunding.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, filmFundingController.apply);
router.get("/applications", auth, filmFundingController.list);

module.exports = router;
