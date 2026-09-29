const odCcLimitService = require("./odCcLimit.service");

module.exports = {
  apply: odCcLimitService.apply,
  list: odCcLimitService.list,

  // Used by the admin application controller.
  sanitizeOdCcLimitResponse: odCcLimitService.sanitize,
};
