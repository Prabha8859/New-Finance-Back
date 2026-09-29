/*
==========================================
Environment loader.

Required FIRST by index.js / server.js / any script, so every other file can
trust that process.env is already populated from .env.
==========================================
*/

require("dotenv").config();

module.exports = process.env;
