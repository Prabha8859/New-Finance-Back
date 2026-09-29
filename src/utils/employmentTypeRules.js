const requiredFor = (employmentType) => function () {
  return this.employmentType === employmentType;
};

/**
 * Business address (state/city/pincode/place status) is required for both
 * self-employed types — Business and Professional.
 */
const requiredForSelfEmployed = function () {
  return ["Self Employed - Business", "Self Employed - Professional"].includes(this.employmentType);
};

/**
 * Salary bank details are required for salaried applicants, except when the
 * salary is received as cash (the dashboard skips the bank field in that case).
 */
const requiredForSalaryBank = function () {
  if (this.employmentType !== "Salaried") return false;
  return String(this.salaryReceivedAs || "").trim().toLowerCase() !== "cash";
};

module.exports = { requiredFor, requiredForSalaryBank, requiredForSelfEmployed };
