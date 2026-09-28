/**
 * Transaction-bank helpers shared by every loan product.
 *
 * The dashboard sends the selected banks in several shapes
 * (string, comma separated string, array, or { displayName, banks }),
 * and the stored form is always { displayName, banks }.
 */

/** Selector placeholders — never real bank names. */
const SENTINEL_BANK_VALUES = new Set(["other", "multiple transaction banks"]);

const SPLIT_ON = ",";

const pushUniqueBank = (banks, rawValue) => {
  if (rawValue === undefined || rawValue === null) return;

  const values = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === "object"
      ? rawValue.banks
      : String(rawValue).split(SPLIT_ON);

  if (!Array.isArray(values)) return;

  values.forEach((item) => {
    const name = String(item ?? "").trim().replace(/\s+/g, " ");
    if (!name || SENTINEL_BANK_VALUES.has(name.toLowerCase())) return;
    if (banks.some((existing) => existing.toLowerCase() === name.toLowerCase())) return;
    banks.push(name);
  });
};

/** Any accepted request shape -> clean list of bank names. */
const toBankNames = (selectedBanks) => {
  const banks = [];
  pushUniqueBank(banks, selectedBanks);
  return banks;
};

const displayNameForBanks = (banks) =>
  banks.length > 1 ? "Multiple Transaction Banks" : banks[0];

/** Request values -> stored shape: { displayName, banks }. */
const normalizeTransactionBanks = (selectedBanks, otherBankName) => {
  const banks = toBankNames(selectedBanks);
  pushUniqueBank(banks, otherBankName);
  return { displayName: displayNameForBanks(banks), banks };
};

/** True when the selected value is a sentinel that needs a free-text bank name. */
const needsCustomBankName = (selectedBanks) => {
  const selected = Array.isArray(selectedBanks)
    ? selectedBanks
    : selectedBanks && typeof selectedBanks === "object"
      ? selectedBanks.banks
      : [selectedBanks];

  return (Array.isArray(selected) ? selected : []).some((item) =>
    SENTINEL_BANK_VALUES.has(String(item ?? "").trim().toLowerCase())
  );
};

module.exports = {
  SENTINEL_BANK_VALUES,
  toBankNames,
  displayNameForBanks,
  normalizeTransactionBanks,
  needsCustomBankName,
};
