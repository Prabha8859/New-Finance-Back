/* =========================================================================
 * LOAN REQUIREMENTS · CREDIT CARD only
 * =========================================================================
 * Used when LOAN_PRODUCTS.creditCard.loanRequirements === "creditCard".
 * (The credit card product is not really a loan — there is no loanAmount /
 *  loanTenure. Its shared section is titled "Credit Card Details".)
 *
 * The dashboard marks both fields without *, so both are optional. "Other"
 * in the bank dropdown gets a free-text partner.
 * ========================================================================= */

const creditCardRequirementFields = {
  hasActiveCard: { type: String, trim: true },
  applyForBank: { type: String, trim: true },
  applyForBankOther: { type: String, trim: true },
};

module.exports = { creditCardRequirementFields };
