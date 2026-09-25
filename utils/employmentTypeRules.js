const requiredFor = (employmentType) => function () {
  return this.employmentType === employmentType;
};

/**
 * Salary bank details are required for salaried applicants, except when the
 * salary is received as cash (the dashboard skips the bank field in that case).
 */
const requiredForSalaryBank = function () {
  if (this.employmentType !== "Salaried") return false;
  return String(this.salaryReceivedAs || "").trim().toLowerCase() !== "cash";
};

module.exports = { requiredFor, requiredForSalaryBank };
