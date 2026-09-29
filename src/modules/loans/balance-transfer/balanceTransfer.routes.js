const router = require("express").Router();

const balanceTransferController = require("./balanceTransfer.controller");
const auth = require("../../../middleware/auth.middleware");
const normalizeApplyPayload = require("../../../middleware/normalizeApplyPayload.middleware");
const { applyValidator } = require("./balanceTransfer.validator");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, balanceTransferController.apply);
router.get("/applications", auth, balanceTransferController.list);

module.exports = router;
