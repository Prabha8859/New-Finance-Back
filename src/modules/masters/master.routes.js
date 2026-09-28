const router = require("express").Router();

const masterController = require("./master.controller");
const auth = require("../../shared/middleware/auth");

router.get("/", masterController.getAllMasters);
router.get("/employment-types", masterController.getEmploymentTypes);
router.get("/states", masterController.getStates);
router.get("/cities", masterController.getCities);
router.get("/:type", masterController.getMasterByType);
router.post("/:type/custom", auth, masterController.addCustomValueForUser);

module.exports = router;
