const creditCardService = require("./creditCard.service");

module.exports = {
  apply: creditCardService.apply,
  list: creditCardService.list,

  // Used by the admin application controller.
  sanitizeCreditCardResponse: creditCardService.sanitize,
};
