const router = require("express").Router();

const creditCardController = require("../controllers/creditCard.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/creditCard.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, creditCardController.apply);
router.get("/applications", auth, creditCardController.list);

module.exports = router;
