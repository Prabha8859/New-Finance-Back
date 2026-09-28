const router = require("express").Router();
const controller = require("./employmentType.controller");

router.get("/", controller.list);
router.get("/:loanType", controller.list);

module.exports = router;
