const filmFundingService = require("./filmFunding.service");

module.exports = {
  apply: filmFundingService.apply,
  list: filmFundingService.list,

  // Used by the admin application controller.
  sanitizeFilmFundingResponse: filmFundingService.sanitize,
};
