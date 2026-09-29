const router = require("express").Router();

const creditCardController = require("./creditCard.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./creditCard.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, creditCardController.apply);
router.get("/applications", auth, creditCardController.list);

module.exports = router;
