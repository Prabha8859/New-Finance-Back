const router = require("express").Router();

const controller = require("./location.controller");
const { locationLimiter } = require("../../middleware/rateLimit.middleware");

/*
==========================================
PUBLIC Location routes — mounted at /api/masters/location (no auth).

These are what the loan application forms call. They expose only `active`
rows, so flipping a city/pincode to inactive in the admin panel immediately
removes it from the forms.

  GET  /pincode/:pincode    user typed a pincode -> city + state + country
  GET  /pincode?q=4000      type-ahead suggestions (pincode or city name)
  POST /pincode/validate    applicant NE "State -> City -> Pincode" bhara hai:
                            typed pincode us chune hue place ka hai ya nahi
  GET  /continents          active continents (cascade ka pehla step)
  GET  /countries           active countries (optionally ?continentId=)
  GET  /states?countryId=   active states of a country
  GET  /cities?stateId=     active cities of a state
==========================================
*/

/* All public location reads sit behind one IP rate limit — they are read-only
   but unauthenticated, so nothing else guards Mongo from a runaway loop. */
router.use(locationLimiter);

router.get("/pincode/:pincode", controller.lookupPincode);
router.get("/pincode", controller.suggestPincodes);

/* State/City selected + pincode typed -> is that pincode really theirs? */
router.post("/pincode/validate", controller.validatePincode);

router.get("/continents", controller.listActive("continents"));
router.get("/countries", controller.listActive("countries"));
router.get("/states", controller.listActive("states"));
router.get("/cities", controller.listActive("cities"));

/* Bare mount path (GET /api/masters/location): without this the request
   falls through to the masters "/:type" catch-all and 404s with
   `Master "location" not found`. Answer with the endpoint index instead. */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Location masters API — use one of the endpoints below.",
    endpoints: [
      "GET /pincode/:pincode",
      "GET /pincode?q=<search>",
      "POST /pincode/validate",
      "GET /continents",
      "GET /countries?continentId=<id>",
      "GET /states?countryId=<id>",
      "GET /cities?stateId=<id>",
    ],
  });
});

module.exports = router;
