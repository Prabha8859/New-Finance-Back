/* =========================================================================
 * LOAN REQUIREMENTS · PROJECT LOAN only
 * =========================================================================
 * Used when LOAN_PRODUCTS.projectLoan.loanRequirements === "projectLoan".
 *
 * A project loan is always against a real project, so every field here is
 * required — exactly like the LAP collateral section.
 * ========================================================================= */

const projectLoanRequirementFields = {
  projectType: {
    type: String,
    trim: true,
    required: [true, "Please select the project type"],
  },
  projectTypeOther: { type: String, trim: true },
  totalProjectCost: {
    type: Number,
    min: 0,
    required: [true, "Total project cost is required"],
  },
  projectStartDate: {
    type: Date,
    required: [true, "Project start date is required"],
  },
  projectCompletionDate: {
    type: Date,
    required: [true, "Project date of completion is required"],
  },
  ownInvestment: { type: Number, default: 0, min: 0 },
};

module.exports = { projectLoanRequirementFields };
