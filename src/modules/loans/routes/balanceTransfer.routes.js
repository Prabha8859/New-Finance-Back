const router = require("express").Router();

const balanceTransferController = require("../controllers/balanceTransfer.controller");
const auth = require("../../../shared/middleware/auth");
const normalizeApplyPayload = require("../../../shared/middleware/normalizeApplyPayload");
const { applyValidator } = require("../validators/balanceTransfer.validators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, balanceTransferController.apply);
router.get("/applications", auth, balanceTransferController.list);

module.exports = router;
