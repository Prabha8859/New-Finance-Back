const router = require("express").Router();

const masterController = require("./master.controller");
const banksDetails = require("./banksDetails.controller");

router.get("/", masterController.list);
router.post("/", masterController.create);
router.post("/custom", masterController.addCustomValue);

/*
Banks — one master ("banks" / "Banks"), no type/label to pass.
Must stay above "/:id" so "banks" is not read as a master id.
*/
router.get("/banks", masterController.listBanks);
router.post("/banks", masterController.addBanks);
router.put("/banks", masterController.replaceBanks);
router.delete("/banks/:name", masterController.deleteBank);

/*
Bank Details page — same "banks" master, richer payload (id/label/kind) and
per-value rename. Must stay above "/:id" as well.
*/
router.get("/banksdetails", banksDetails.details);
router.post("/banksdetails", banksDetails.addOne);
router.put("/banksdetails/:value", banksDetails.renameOne);
router.delete("/banksdetails/:value", banksDetails.removeOne);

/*
NOTE: the admin Location Master lives in its own relational module
(src/modules/location) and is mounted at /api/admin/masters/location.
It no longer shares the generic grouped-master store.
*/

router.get("/states", masterController.getStates);
router.post("/states", masterController.addState);
router.get("/states/:state/cities", masterController.getCities);
router.get("/states/:state/cities/:city/pincodes", masterController.getPincodes);
router.get("/cities", masterController.getCities);
router.get("/pincodes", masterController.getPincodes);
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
