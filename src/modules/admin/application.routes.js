const router = require("express").Router();

const {
  RESOURCE_ROUTES,
  getListHandler,
  getByIdHandler,
  updateStatusHandler,
} = require("../loans/shared/adminStatus.service");
const dashboardController = require("./dashboard.controller");

/*
==========================================
One registry drives every product so all 14 resources get the same three
endpoints (see ../loans/shared/adminStatus.service.js).
==========================================
*/

Object.keys(RESOURCE_ROUTES).forEach((resource) => {
  router.get(`/${resource}`, getListHandler(resource));
  router.get(`/${resource}/:id`, getByIdHandler(resource));
  router.patch(`/${resource}/:id/status`, updateStatusHandler(resource));
});

/* Dashboard stats (replaces the frontend's 15-request fan-out). */
router.get("/dashboard/stats", dashboardController.stats);

module.exports = router;
