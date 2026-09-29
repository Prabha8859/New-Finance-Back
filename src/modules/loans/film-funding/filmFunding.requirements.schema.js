/*
=========================================================================
LOAN REQUIREMENTS · FILM FUNDING only
=========================================================================
Used when LOAN_PRODUCTS.filmFunding.loanRequirements === "filmFunding".

Funding a film means the film itself is what the money is lent against, so
the film's identity (industry + languages + star cast) and its money
(project cost + own investment) are all mandatory.

`ownInvestmentAmount` must cover at least 20% of `totalProjectCost` — that
rule lives in the rules file (filmFunding.requirements.rules.js).

filmLanguages (checkbox list) and starCastNames ("Add" button) are repeatable
fields, so they are stored as arrays. The dashboard may send a real array or a
CSV string; both are accepted (see `multiValueFields` in loanProducts.js).
=========================================================================
*/

const filmFundingRequirementFields = {
  filmComesUnder: {
    type: String,
    trim: true,
    required: [true, "Please select the film's industry"],
  },
  filmComesUnderOther: { type: String, trim: true },
  filmLanguages: { type: [String], default: [] },
  starCastNames: { type: [String], default: [] },
  totalProjectCost: {
    type: Number,
    min: 1,
    required: [true, "Total film project cost is required"],
  },
  ownInvestmentAmount: {
    type: Number,
    min: 0,
    required: [true, "Own investment amount is required"],
  },
};

module.exports = { filmFundingRequirementFields };
