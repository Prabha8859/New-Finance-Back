const masterService = require("../../services/admin/master.service");

/*
==========================================
List Masters
GET /api/admin/masters
==========================================
*/
exports.list = async (req, res, next) => {
  try {
    const masters = await masterService.listMasters();
    res.json({ success: true, masters });
  } catch (error) {
    next(error);
  }
};

exports.getStates = async (req, res, next) => {
  try {
    const states = await masterService.getStates();
    res.json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const cities = await masterService.getCitiesByState(req.params.state || req.query.state);
    res.json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

exports.addState = async (req, res, next) => {
  try {
    const input = Array.isArray(req.body.values) ? req.body.values : [req.body.state ?? req.body.value];
    const states = [];
    for (const state of input) states.push(await masterService.addState(state));
    res.status(201).json({ success: true, message: "States added successfully", data: { states } });
  } catch (error) {
    next(error);
  }
};

exports.updateState = async (req, res, next) => {
  try {
    const state = await masterService.updateState(req.params.state, req.body.state ?? req.body.value);
    res.json({ success: true, message: "State updated successfully", data: { state } });
  } catch (error) {
    next(error);
  }
};

exports.deleteState = async (req, res, next) => {
  try {
    await masterService.deleteState(req.params.state);
    res.json({ success: true, message: "State deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.addCity = async (req, res, next) => {
  try {
    const input = Array.isArray(req.body.values)
      ? req.body.values
      : [req.body.city ?? req.body.value];
    const cities = [];
    for (const city of input) cities.push(await masterService.addCity(req.params.state, city));
    res.status(201).json({ success: true, message: "Cities added successfully", data: { cities } });
  } catch (error) {
    next(error);
  }
};

exports.updateCity = async (req, res, next) => {
  try {
    const city = await masterService.updateCity(
      req.params.state,
      req.params.city,
      req.body.city ?? req.body.value
    );
    res.json({ success: true, message: "City updated successfully", data: { city } });
  } catch (error) {
    next(error);
  }
};

exports.deleteCity = async (req, res, next) => {
  try {
    await masterService.deleteCity(req.params.state, req.params.city);
    res.json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Get One Master
GET /api/admin/masters/:id
==========================================
*/
exports.getOne = async (req, res, next) => {
  try {
    const master = await masterService.getMasterById(req.params.id);
    res.json({ success: true, master });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Create Master
POST /api/admin/masters
==========================================
*/
exports.create = async (req, res, next) => {
  try {
    const { type, label, values } = req.body;
    const master = await masterService.createMaster({ type, label, values });
    res.status(201).json({
      success: true,
      message: "Master created successfully",
      master,
    });
  } catch (error) {
    next(error);
  }
};

exports.addCustomValue = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    const master = await masterService.addCustomValue({ type, value });

    res.status(201).json({
      success: true,
      message: "Custom master value added successfully",
      master,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Update Master Label
PUT /api/admin/masters/:id
==========================================
*/
exports.updateLabel = async (req, res, next) => {
  try {
    const { label } = req.body;
    const master = await masterService.updateMasterLabel(req.params.id, label);
    res.json({
      success: true,
      message: "Master updated successfully",
      master,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Replace Master Values
PUT /api/admin/masters/:id/values
==========================================
*/
exports.replaceValues = async (req, res, next) => {
  try {
    const { values } = req.body;
    const master = await masterService.replaceMasterValues(req.params.id, values);
    res.json({
      success: true,
      message: "Values saved successfully",
      master,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Delete Master
DELETE /api/admin/masters/:id
==========================================
*/
exports.remove = async (req, res, next) => {
  try {
    await masterService.deleteMaster(req.params.id);
    res.json({ success: true, message: "Master deleted successfully" });
  } catch (error) {
    next(error);
  }
};
