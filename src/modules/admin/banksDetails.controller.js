const masterService = require("../masters/master.service");

/*
==========================================
Bank Details page — same "banks" master the dropdowns use, but this page's
contract wants id/type/label/kind plus per-value rename, so it gets its own
controller on top of master.service's bank helpers.
==========================================
*/

const detailsPayload = (master, values) => ({
  id: master._id,
  type: master.type,
  label: master.label,
  kind: "list",
  values,
  updatedAt: master.updatedAt,
});

/* GET /api/admin/masters/banksdetails */
exports.details = async (req, res, next) => {
  try {
    const master = await masterService.getBankMaster();
    res.json({
      success: true,
      data: detailsPayload(master, Array.isArray(master.values) ? master.values : []),
    });
  } catch (error) {
    next(error);
  }
};

/* POST /api/admin/masters/banksdetails   { value } */
exports.addOne = async (req, res, next) => {
  try {
    const master = await masterService.addBanks(req.body);
    const values = Array.isArray(master.values) ? master.values : [];
    res.status(201).json({
      success: true,
      message: "Bank added successfully",
      data: detailsPayload(master, values),
    });
  } catch (error) {
    next(error);
  }
};

/* PUT /api/admin/masters/banksdetails/:value   { value: "New Name" } */
exports.renameOne = async (req, res, next) => {
  try {
    const master = await masterService.renameBank(req.params.value, req.body?.value);
    res.json({
      success: true,
      message: "Bank updated successfully",
      data: detailsPayload(master, master.values),
    });
  } catch (error) {
    next(error);
  }
};

/* DELETE /api/admin/masters/banksdetails/:value */
exports.removeOne = async (req, res, next) => {
  try {
    const deleted = await masterService.deleteBank(req.params.value);
    res.json({ success: true, message: `Bank "${deleted}" deleted successfully` });
  } catch (error) {
    next(error);
  }
};
