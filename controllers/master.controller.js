const Master = require("../models/Master");

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
