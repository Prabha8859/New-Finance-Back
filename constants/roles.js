/*
==========================================
Shared role/token-type constants.
Keeps the "type" claim used to separate admin vs. customer
JWTs (see middleware/adminAuth.js, utils/generateAdminToken.js)
out of hardcoded strings scattered across the codebase.
==========================================
*/

const TOKEN_TYPE = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

module.exports = { TOKEN_TYPE };
