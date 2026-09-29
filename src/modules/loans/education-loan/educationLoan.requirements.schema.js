/* =========================================================================
 * LOAN REQUIREMENTS · EDUCATION LOAN only
 * =========================================================================
 * Used when LOAN_PRODUCTS.educationLoan.loanRequirements === "educationLoan".
 *
 * The dashboard marks every field with * (required), so unlike the Vehicle Loan
 * vehicle fields these are mandatory. The three dropdowns that offer "Other"
 * get a free-text partner field.
 * ========================================================================= */

const educationLoanRequirementFields = {
  educationCountry: {
    type: String,
    trim: true,
    required: [true, "Please select the country for education"],
  },
  educationCountryOther: { type: String, trim: true },
  fieldOfStudy: {
    type: String,
    trim: true,
    required: [true, "Please select the field of study"],
  },
  fieldOfStudyOther: { type: String, trim: true },
  courseName: {
    type: String,
    trim: true,
    required: [true, "Course name is required"],
  },
  university: {
    type: String,
    trim: true,
    required: [true, "University is required"],
  },
  instituteName: {
    type: String,
    trim: true,
    required: [true, "Institute name is required"],
  },
  enrollmentStatus: {
    type: String,
    trim: true,
    required: [true, "Please select the enrollment status"],
  },
  enrollmentStatusOther: { type: String, trim: true },
  courseDuration: {
    type: Number,
    min: 0,
    required: [true, "Course duration is required"],
  },
  educationCost: {
    type: Number,
    min: 0,
    required: [true, "Education cost is required"],
  },
};

module.exports = { educationLoanRequirementFields };
