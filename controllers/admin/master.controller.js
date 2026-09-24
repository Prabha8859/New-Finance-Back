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
