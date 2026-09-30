const locationService = require("./location.service");
const isTrue = require("../../utils/isTrue");

/*
==========================================
Location Master controller.

Handlers are generated per resource (continents/countries/states/cities/
pincodes) from the service registry, so every level answers with the exact
same envelope:

  success -> { success: true,  message, data }
  error   -> { success: false, message }        (via error.middleware)
==========================================
*/

const labelOf = (resource) => locationService.RESOURCES[resource].label;
const pluralOf = (resource) => locationService.RESOURCES[resource].plural;

/*
GET /api/admin/masters/location
Counts only — never the records.
*/
exports.summary = async (req, res, next) => {
  try {
    const data = await locationService.summary();
    res.json({ success: true, message: "Location summary fetched successfully", data });
  } catch (error) {
    next(error);
  }
};

/*
GET /api/admin/masters/location/<resource>
  ?<parent>Id=   scope to a parent (required for a cascade dropdown)
  ?status=       active | inactive | coming_soon
  ?search=       case-insensitive name / pincode search
  ?page= &limit= pagination (?limit=all for everything)
*/
exports.list = (resource) => async (req, res, next) => {
  try {
    const { data, count, total, page, limit } = await locationService.list(resource, req.query);

    res.json({
      success: true,
      message: `${pluralOf(resource)} fetched successfully`,
      count,
      total,
      page,
      limit,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
GET /api/admin/masters/location/pincodes/table

Flat, paginated, searchable table of every pincode with its city / state /
country names attached — for a single searchable table in the admin panel
instead of five chained cascade calls.
  ?search=400 (pincode prefix) | ?search=mumbai (city) | ?search=goa (state)
  ?stateId= &cityId= &status= &page= &limit= (default 50, max 500)
*/
exports.pincodeTable = async (req, res, next) => {
  try {
    const { data, count, total, page, limit, totalPages } =
      await locationService.listPincodesFlat(req.query);

    res.json({
      success: true,
      message: "Pincodes fetched successfully",
      count,
      total,
      page,
      limit,
      totalPages,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
Same list, but only `active` rows — what the PUBLIC loan forms are allowed
to see. An inactive/coming_soon master row simply never reaches an applicant.
*/
exports.listActive = (resource) => async (req, res, next) => {
  try {
    const { data, count, total, page, limit } = await locationService.list(resource, {
      ...req.query,
      status: "active",
    });

    res.json({
      success: true,
      message: `${pluralOf(resource)} fetched successfully`,
      count,
      total,
      page,
      limit,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
GET /api/masters/location/pincode/:pincode

The applicant types a pincode and the form auto-fills city/state/country.
*/
exports.lookupPincode = async (req, res, next) => {
  try {
    const data = await locationService.lookupPincode(req.params.pincode);
    res.json({ success: true, message: "Pincode matched successfully", data });
  } catch (error) {
    next(error);
  }
};

/*
POST /api/masters/location/pincode/validate

The applicant filled State -> City -> Pincode. This checks the typed pincode
against the chosen place and answers with a ready-to-display message.

Body (names OR relational ids):
  { "pincode": "400001", "state": "Maharashtra", "city": "Mumbai" }
  { "pincode": "400001", "stateId": "…", "cityId": "…", "strict": true }

Always HTTP 200 for a well-formed request — check `valid`:
  { "success": true,  "valid": true,  "message": "Pincode verified successfully", "data": {…} }
  { "success": false, "valid": false, "message": "Pincode \"400001\" belongs to Mumbai…", "data": {…} }
400 only for a malformed request (missing pincode / non-digits / no state-city given).
*/
exports.validatePincode = async (req, res, next) => {
  try {
    const result = await locationService.validatePincodeForPlace({
      ...req.query,
      ...req.body,
    });

    res.json({
      success: result.valid,
      valid: result.valid,
      stateChecked: result.stateChecked,
      cityChecked: result.cityChecked,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

/* GET /api/masters/location/pincode?q=4000  — type-ahead suggestions. */
exports.suggestPincodes = async (req, res, next) => {
  try {
    const data = await locationService.suggestPincodes(
      req.query.q ?? req.query.query ?? req.query.pincode,
      req.query.limit
    );
    res.json({ success: true, message: "Pincodes fetched successfully", count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/* POST /api/admin/masters/location/<resource> */
exports.create = (resource) => async (req, res, next) => {
  try {
    const data = await locationService.create(resource, req.body);

    res.status(201).json({
      success: true,
      message: `${labelOf(resource)} created successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* PATCH /api/admin/masters/location/<resource>/:id */
exports.update = (resource) => async (req, res, next) => {
  try {
    const data = await locationService.update(resource, req.params.id, req.body);

    res.json({
      success: true,
      message: `${labelOf(resource)} updated successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
DELETE /api/admin/masters/location/<resource>/:id
Soft delete (status -> inactive) unless ?hard=true.
A parent with live children needs ?force=true to cascade.
*/
exports.remove = (resource) => async (req, res, next) => {
  try {
    const result = await locationService.remove(resource, req.params.id, {
      hard: isTrue(req.query.hard),
      force: isTrue(req.query.force),
    });

    res.json({
      success: true,
      message: `${labelOf(resource)} ${
        result.mode === "deleted" ? "deleted" : "deactivated"
      } successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
