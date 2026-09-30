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

router.get("/countries", controller.listActive("countries"));
router.get("/states", controller.listActive("states"));
router.get("/cities", controller.listActive("cities"));

module.exports = router;
