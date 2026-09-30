const router = require("express").Router();

const customerController = require("./customer.controller");

router.get("/", customerController.list);
router.get("/:id", customerController.getOne);
router.get("/:id/applications", customerController.listApplications);
router.patch("/:id/status", customerController.setStatus);
router.delete("/:id", customerController.remove);

module.exports = router;
