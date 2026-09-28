/* =========================================================================
 * LOAN REQUIREMENTS · BALANCE TRANSFER only
 * =========================================================================
 * Used when LOAN_PRODUCTS.balanceTransfer.loanRequirements === "balanceTransfer".
 *
 * The loan being transferred is the whole point of this product, so its type is
 * mandatory. The property value only applies to secured loans and the top-up is
 * optional, so both are plain optional numbers.
 * ========================================================================= */

const balanceTransferRequirementFields = {
  balanceTransferType: {
    type: String,
    trim: true,
    required: [true, "Please select the type of balance transfer"],
  },
  balanceTransferTypeOther: { type: String, trim: true },
  currentPropertyValue: { type: Number, default: 0 },
  topUpAmount: { type: Number, default: 0 },
};

module.exports = { balanceTransferRequirementFields };
