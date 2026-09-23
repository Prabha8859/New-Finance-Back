const router = require("express").Router();

const adminAuth = require("../../middleware/adminAuth");

/*
========================================
Admin API Router
All admin-facing routes are namespaced under /api/admin
and kept isolated from the public/user-facing API.
========================================
*/

router.use("/auth", require("./adminAuth.routes"));

router.use("/masters", adminAuth, require("./master.routes"));

router.use("/customers", adminAuth, require("./customer.routes"));

module.exports = router;
