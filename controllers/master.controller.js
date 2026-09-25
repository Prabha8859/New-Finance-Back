const Master = require("../models/Master");
const adminMasterService = require("../services/admin/master.service");
const { EMPLOYMENT_TYPES } = require("../constants/employmentTypes");

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

exports.getAllMasters = async (req, res, next) => {
  try {
    const masters = await Master.find().sort({ type: 1 });

    const data = {};
    masters.forEach((m) => {
      data[m.type] = m.values;
    });

    res.status(200).json({ success: true, data });
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

    const master = await Master.findOne({ type });

    if (!master) {
      return res.status(404).json({
        success: false,
        message: `Master "${type}" not found`,
      });
    }

    if (Array.isArray(master.values)) {
      const cleanValue = String(value).trim();
      const exists = master.values.some(
        (item) => String(item).trim().toLowerCase() === cleanValue.toLowerCase()
      );

      if (!exists) {
        master.values.push(cleanValue);
        await master.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Bank added successfully",
      data: master.values,
    });
  } catch (error) {
    next(error);
  }
};
