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
