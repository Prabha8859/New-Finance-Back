const Master = require("./master.model");
const adminMasterService = require("./master.service");
const { EMPLOYMENT_TYPES } = require("../../constants/employmentTypes");

exports.getEmploymentTypes = async (req, res, next) => {
  try {
    const loanType = String(req.query.loanType ?? "").trim().toLowerCase();
    const types = loanType === "personal"
      ? EMPLOYMENT_TYPES.personal
      : loanType === "business"
      ? EMPLOYMENT_TYPES.business
      : null;

    if (!types) {
      return res.status(400).json({
        success: false,
        message: "loanType must be personal or business",
      });
    }

    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
};

exports.getStates = async (req, res, next) => {
  try {
    const states = await adminMasterService.getStates();
    res.json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const cities = await adminMasterService.getCitiesByState(req.query.state);
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
GET /api/masters/pincodes?state=..&city=..

Dependent lookup (State -> City -> Pincodes) over the seeded
"pincodesByLocation" master. A city with no seeded list answers [] so the
frontend can fall back to its "Other" pincode input.
==========================================
*/
exports.getPincodes = async (req, res, next) => {
  try {
    const pincodes = await adminMasterService.getPincodesForCity(req.query.state, req.query.city);
    res.json({ success: true, data: pincodes });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
State/city dropdowns always come from the "states" + "citiesByState"
masters (same hardcoded types the service already uses).
==========================================
*/
const collectLocations = (data) => {
  const locations = {};

  if (data.states !== undefined) locations.states = data.states;
  if (data.citiesByState !== undefined) locations.citiesByState = data.citiesByState;

  return locations;
};

/*
==========================================
GET /api/masters

Banks and locations used to sit as indistinguishable siblings inside one
flat bucket (Bank01, bank01, banks, states, citiesByState...). The response
now exposes them separately:

  {
    success: true,
    banks:     ["HDFC Bank", "ICICI Bank"],
    locations: { states: [...], citiesByState: { "State": ["City"] } },
    data:      { ...unchanged flat type -> values map (back-compat)... }
  }

`data` is kept exactly as before so no existing consumer breaks.
==========================================
*/
exports.getAllMasters = async (req, res, next) => {
  try {
    const masters = await Master.find().sort({ type: 1 });

    const data = {};
    masters.forEach((m) => {
      data[m.type] = m.values;
    });

    res.status(200).json({
      success: true,
      banks: await adminMasterService.getBankNames(),
      locations: collectLocations(data),
      data,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
GET /api/masters/banks

Banks-only list for the public loan forms — no states, no cities, no
mixing. Public route, no token needed.

  { "success": true, "data": ["HDFC Bank", "ICICI Bank"] }
==========================================
*/
exports.getBanks = async (req, res, next) => {
  try {
    const banks = await adminMasterService.getBankNames();
    res.json({ success: true, data: banks });
  } catch (error) {
    next(error);
  }
};

exports.getMasterByType = async (req, res, next) => {
  try {
    const master = await Master.findOne({ type: req.params.type });

    if (!master) {
      const error = new Error(`Master "${req.params.type}" not found`);
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: master.values });
  } catch (error) {
    next(error);
  }
};

exports.addCustomValueForUser = async (req, res, next) => {
  try {
    const { value } = req.body;
    const { type } = req.params;

    if (!value || !String(value).trim()) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required",
      });
    }

    /*
    Delegates to the shared add-value logic instead of pushing into
    master.values directly: `values` is a Mixed field, so a raw .push() is not
    change-tracked by mongoose and the new bank never reached the database
    (the API still answered 200 with the in-memory list).
    */
    const master = await adminMasterService.addCustomValue({ type, value });

    res.status(200).json({
      success: true,
      message: "Bank added successfully",
      data: master.values,
    });
  } catch (error) {
    next(error);
  }
};
