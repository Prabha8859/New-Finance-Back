/*
Shared flag parser for query-string style values ("true", "1", "yes") and
real booleans — used by ?force= / ?hard= / strict flags across modules.
*/
module.exports = function isTrue(value) {
  return (
    value === true ||
    ["true", "1", "yes"].includes(String(value ?? "").trim().toLowerCase())
  );
};
