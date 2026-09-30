const router = require("express").Router();

const controller = require("./location.controller");

/*
==========================================
Location Master routes — mounted at /api/admin/masters/location (admin auth
is applied by the parent router in src/modules/admin/index.js).

  GET    /                          counts only (no records)
  GET    /continents                ?status= &search= &page= &limit=
  POST   /continents                { name, status? }
  PATCH  /continents/:id            { name?, status? }
  DELETE /continents/:id            ?force=true &hard=true

  GET    /countries?continentId=    ?status= &search= ...
  POST   /countries                 { name, continentId, status? }
  PATCH  /countries/:id
  DELETE /countries/:id

  GET    /states?countryId=
  POST   /states                    { name, countryId, status? }
  PATCH  /states/:id
  DELETE /states/:id

  GET    /cities?stateId=
  POST   /cities                    { name, stateId, status? }
  PATCH  /cities/:id
  DELETE /cities/:id

  GET    /pincodes?cityId= (or ?stateId=)
  GET    /pincodes/table            flat, paginated, searchable table with
                                    city/state/country names attached
  POST   /pincodes                  { pincode, cityId, prefix?, status? }
  PATCH  /pincodes/:id
  DELETE /pincodes/:id
==========================================
*/

/* Overview / counts — must stay above the resource routes. */
router.get("/", controller.summary);

/* Flat pincode table — registered BEFORE the resource loop so it can never be
   shadowed by a future GET /pincodes/:id. */
router.get("/pincodes/table", controller.pincodeTable);

["continents", "countries", "states", "cities", "pincodes"].forEach((resource) => {
  router.get(`/${resource}`, controller.list(resource));
  router.post(`/${resource}`, controller.create(resource));
  router.patch(`/${resource}/:id`, controller.update(resource));
  router.delete(`/${resource}/:id`, controller.remove(resource));
});

module.exports = router;
