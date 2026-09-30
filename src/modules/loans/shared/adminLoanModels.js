/*
==========================================
Model registry for the admin modules.

Re-exports the shared MODELS map (./loanModels.js — a leaf module, no
circular imports) so the admin endpoints and the public loan endpoints
always address the exact same collections.
==========================================
*/

const { MODELS } = require("./loanModels");

module.exports = { MODELS };
