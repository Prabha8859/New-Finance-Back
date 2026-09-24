const router = require("express").Router();

const masterController = require("../controllers/master.controller");
const auth = require("../middleware/auth");

router.get("/", masterController.getAllMasters);
router.get("/:type", masterController.getMasterByType);
router.post("/:type/custom", auth, masterController.addCustomValueForUser);

module.exports = router;
