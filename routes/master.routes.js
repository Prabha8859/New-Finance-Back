const router = require("express").Router();

const masterController = require("../controllers/master.controller");

router.get("/", masterController.getAllMasters);
router.get("/:type", masterController.getMasterByType);

module.exports = router;
