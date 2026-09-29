const router = require("express").Router();

const commercialPurchaseController = require("./commercialPurchase.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./commercialPurchase.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, commercialPurchaseController.apply);
router.get("/applications", auth, commercialPurchaseController.list);

module.exports = router;
