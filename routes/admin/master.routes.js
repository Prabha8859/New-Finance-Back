const router = require("express").Router();

const masterController = require("../../controllers/admin/master.controller");

router.get("/", masterController.list);
router.post("/", masterController.create);
router.post("/custom", masterController.addCustomValue);
router.get("/states", masterController.getStates);
router.post("/states", masterController.addState);
router.get("/states/:state/cities", masterController.getCities);
router.get("/cities", masterController.getCities);
router.put("/states/:state", masterController.updateState);
router.delete("/states/:state", masterController.deleteState);
router.post("/states/:state/cities", masterController.addCity);
router.put("/states/:state/cities/:city", masterController.updateCity);
router.delete("/states/:state/cities/:city", masterController.deleteCity);

router.get("/:id", masterController.getOne);
router.put("/:id", masterController.updateLabel);
router.delete("/:id", masterController.remove);

router.put("/:id/values", masterController.replaceValues);

module.exports = router;
