const { validationResult } = require("express-validator");

/** Run after a validator chain; short-circuits with 400 if any rule failed. */
module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
};
