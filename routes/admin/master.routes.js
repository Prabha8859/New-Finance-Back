const router = require("express").Router();

const masterController = require("../../controllers/admin/master.controller");

router.get("/", masterController.list);
router.post("/", masterController.create);

router.get("/:id", masterController.getOne);
router.put("/:id", masterController.updateLabel);
router.delete("/:id", masterController.remove);

router.put("/:id/values", masterController.replaceValues);

module.exports = router;
