/* =========================================================================
 * STEP 1 — Loan Basics (same for every product)
 * =========================================================================
 * The two fields every loan application has, plus the fields the server owns
 * (the applicant must never send those).
 * ========================================================================= */

/** Fields the applicant always fills (loanTenure is stored in MONTHS). */
const LOAN_FIELD_NAMES = ["loanAmount", "loanTenure"];

/** Set by the server / route, never by the applicant. */
const SERVER_MANAGED_FIELD_NAMES = ["user", "loanType", "status", "createdAt", "updatedAt", "__v", "_id"];

module.exports = { LOAN_FIELD_NAMES, SERVER_MANAGED_FIELD_NAMES };
