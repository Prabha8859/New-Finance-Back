const workingCapitalService = require("./workingCapital.service");

module.exports = {
  apply: workingCapitalService.apply,
  list: workingCapitalService.list,

  // Used by the admin application controller.
  sanitizeWorkingCapitalResponse: workingCapitalService.sanitize,
};
