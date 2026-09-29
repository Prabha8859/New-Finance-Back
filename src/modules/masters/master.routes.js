const router = require("express").Router();

const masterController = require("./master.controller");
const auth = require("../../middleware/auth.middleware");

router.get("/", masterController.getAllMasters);
router.get("/employment-types", masterController.getEmploymentTypes);
router.get("/states", masterController.getStates);
router.get("/cities", masterController.getCities);

// Dependent pincode lookup — must stay above "/:type" or a "pincodes" type
// master would be shadowed.
router.get("/pincodes", masterController.getPincodes);

// Banks-only list (must stay above "/:type" or "banks" would be read as an id)
router.get("/banks", masterController.getBanks);

router.get("/:type", masterController.getMasterByType);
router.post("/:type/custom", auth, masterController.addCustomValueForUser);

module.exports = router;
