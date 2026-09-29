const router = require("express").Router();

const leaseRentalDiscountingController = require("./leaseRentalDiscounting.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./leaseRentalDiscounting.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, leaseRentalDiscountingController.apply);
router.get("/applications", auth, leaseRentalDiscountingController.list);

module.exports = router;
