const router = require("express").Router();

const customerController = require("../../controllers/admin/customer.controller");

router.get("/", customerController.list);
router.get("/:id", customerController.getOne);

module.exports = router;
