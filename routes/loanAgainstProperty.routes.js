const router = require("express").Router();

const auth = require("../middleware/auth");
const controller = require("../controllers/loanAgainstProperty.controller");
const normalizeApplyPayload = require("../middleware/normalizeApplyPayload");
const { applyValidator } = require("../middleware/validators/loanAgainstPropertyValidators");

router.post("/apply", auth, normalizeApplyPayload, applyValidator, controller.apply);
router.get("/applications", auth, controller.list);

module.exports = router;
