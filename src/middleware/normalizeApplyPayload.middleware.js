const { normalizeApplyPayload } = require("../utils/normalizeLoanPayload");

/**
 * Runs before the apply validators so dashboard field names are mapped onto the
 * canonical model fields (and server-owned fields are dropped) before validation.
 */
module.exports = (req, res, next) => {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    req.body = normalizeApplyPayload(req.body);
  }

  next();
};
