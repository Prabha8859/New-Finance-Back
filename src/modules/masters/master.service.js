const Master = require("./master.model");

/*
==========================================
Master data is a generic type -> values store used to power every dropdown
across the public loan application forms (states, banks, employment types,
tenure years, etc). Two shapes exist today:
  - "list"    values: string[] | number[]
  - "grouped" values: { [groupKey]: (string[] | number[]) }  e.g. citiesByState
==========================================
*/

const TYPE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const getKind = (values) => {
  if (Array.isArray(values)) return "list";
  if (isPlainObject(values)) return "grouped";
  return "unknown";
};

/*
==========================================
Validates + normalizes a flat list of values.
Rules: no empty strings, no duplicates (case-insensitive), consistent
primitive type (numbers stay numbers, everything else becomes a
trimmed string).
==========================================
*/
const normalizeList = (values, label = "Values") => {
  if (!Array.isArray(values)) {
    throw badRequest(`${label} must be a list`);
  }

  const seen = new Set();
  const cleaned = [];

  values.forEach((raw, index) => {
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) {
        throw badRequest(`${label}: item ${index + 1} is not a valid number`);
      }
      const dedupeKey = `n:${raw}`;
      if (seen.has(dedupeKey)) {
        throw badRequest(`${label}: duplicate value "${raw}"`);
      }
      seen.add(dedupeKey);
      cleaned.push(raw);
      return;
    }

    const str = String(raw ?? "").trim();
    if (!str) {
      throw badRequest(`${label}: item ${index + 1} cannot be empty`);
    }
    if (str.length > 150) {
      throw badRequest(`${label}: item ${index + 1} is too long (max 150 characters)`);
    }
    const dedupeKey = `s:${str.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      throw badRequest(`${label}: duplicate value "${str}"`);
    }
    seen.add(dedupeKey);
    cleaned.push(str);
  });

  return cleaned;
};

/*
==========================================
Validates + normalizes a grouped values object (e.g. citiesByState).
Rules: non-empty group keys, no duplicate group keys (case-insensitive),
each group's list validated with normalizeList.
==========================================
*/
const normalizeGrouped = (values) => {
  if (!isPlainObject(values)) {
    throw badRequest("Values must be an object of grouped lists");
  }

  const cleaned = {};
  const seenKeys = new Set();

  for (const [rawKey, rawList] of Object.entries(values)) {
    const key = String(rawKey ?? "").trim();
    if (!key) {
      throw badRequest("Group name cannot be empty");
    }
    if (key.length > 100) {
      throw badRequest(`Group name "${key}" is too long (max 100 characters)`);
    }
    const dedupeKey = key.toLowerCase();
    if (seenKeys.has(dedupeKey)) {
      throw badRequest(`Duplicate group name "${key}"`);
    }
    seenKeys.add(dedupeKey);
    cleaned[key] = normalizeList(rawList, `Group "${key}"`);
  }

  return cleaned;
};

const normalizeValues = (values) => {
  if (Array.isArray(values)) return normalizeList(values);
  return normalizeGrouped(values);
};

const appendUniqueValue = (values, rawValue) => {
  const safeValues = Array.isArray(values) ? values : [];
  const valueText = String(rawValue ?? "").trim();

  if (!valueText) {
    throw badRequest("Value is required");
  }

  if (valueText.length > 150) {
    throw badRequest("Custom value is too long (max 150 characters)");
  }

  const normalizedValues = safeValues.map((item) => String(item ?? "").trim());
  const exists = normalizedValues.some(
    (item) => item && item.toLowerCase() === valueText.toLowerCase()
  );

  if (exists) {
    return safeValues;
  }

  return [...safeValues, valueText];
};

const normalizeType = (type) => {
  const trimmed = String(type ?? "").trim();
  if (!trimmed) throw badRequest("Type key is required");
  if (!TYPE_KEY_REGEX.test(trimmed)) {
    throw badRequest(
      "Type key must start with a letter and contain only letters and numbers (no spaces or symbols)"
    );
  }
  if (trimmed.length > 60) throw badRequest("Type key is too long (max 60 characters)");
  return trimmed;
};

const normalizeLabel = (label) => {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) throw badRequest("Label is required");
  if (trimmed.length > 100) throw badRequest("Label is too long (max 100 characters)");
  return trimmed;
};

const normalizeTextValue = (value, label) => {
  const cleaned = String(value ?? "").trim();
  if (!cleaned) throw badRequest(`${label} is required`);
  if (cleaned.length > 150) throw badRequest(`${label} is too long (max 150 characters)`);
  return cleaned;
};

/*
==========================================
PINCodes

The "pincodesByLocation" master (built by scripts/seedPincodes.js) is a grouped
list keyed by `${slug(state)}::${slug(city)}` — the same slug format is used
here so lookups always agree with the seed data. Cities with no seeded pincode
list return [] and the form falls back to a plain "Other" pincode entry.
==========================================
*/
const PINCODES_MASTER_TYPE = "pincodesByLocation";

const locationSlug = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const findPincodeGroupKey = (values, state, city) => {
  const expectedKey = `${locationSlug(state)}::${locationSlug(city)}`;
  const keys = Object.keys(values);

  // Fast path: the seed keys are already lowercase slugs.
  if (keys.includes(expectedKey)) return expectedKey;

  // Fallback: match case-insensitively so hand-edited keys still resolve.
  const expected = expectedKey.toLowerCase();
  return keys.find((key) => key.toLowerCase() === expected);
};

/* All pincodes of one city under a state (dependent lookup: state -> city -> pincodes). */
const getPincodesForCity = async (state, city) => {
  const cleanState = normalizeTextValue(state, "State");
  const cleanCity = normalizeTextValue(city, "City");

  const master = await Master.findOne({ type: PINCODES_MASTER_TYPE });
  if (!master || !isPlainObject(master.values)) return [];

  const groupKey = findPincodeGroupKey(master.values, cleanState, cleanCity);
  if (!groupKey) return [];

  return normalizeList(master.values[groupKey], `Pincodes of ${cleanCity}`);
};

/* Every `${state}::${city}` location that has a seeded pincode list. */
const listPincodeLocations = async () => {
  const master = await Master.findOne({ type: PINCODES_MASTER_TYPE });
  if (!master || !isPlainObject(master.values)) return [];

  return Object.keys(master.values).sort();
};

const getCitiesByState = async (state) => {
  const cleanState = normalizeTextValue(state, "State");
  const master = await Master.findOne({ type: "citiesByState" });
  if (!master) return [];
  if (!isPlainObject(master.values)) return [];

  const actualState = Object.keys(master.values).find(
    (key) => key.toLowerCase() === cleanState.toLowerCase()
  );
  return actualState ? normalizeList(master.values[actualState], `Cities of ${actualState}`) : [];
};

const getStates = async () => {
  const master = await Master.findOne({ type: "states" });
  return master ? normalizeList(master.values, "States") : [];
};

const addState = async (state) => {
  const cleanState = normalizeTextValue(state, "State");
  let states = await Master.findOne({ type: "states" });

  if (!states) {
    states = await Master.create({ type: "states", label: "Indian States", values: [cleanState] });
  } else {
    const values = normalizeList(states.values, "States");
    const exists = values.some((item) => item.toLowerCase() === cleanState.toLowerCase());
    if (!exists) {
      states.values = [...values, cleanState].sort();
      states.markModified("values");
      await states.save();
    }
  }

  let cities = await Master.findOne({ type: "citiesByState" });
  if (!cities) {
    await Master.create({ type: "citiesByState", label: "Cities by State", values: { [cleanState]: [] } });
  } else {
    const groupedValues = isPlainObject(cities.values) ? cities.values : {};
    if (!Object.prototype.hasOwnProperty.call(groupedValues, cleanState)) {
      cities.values = { ...groupedValues, [cleanState]: [] };
      cities.markModified("values");
      await cities.save();
    }
  }

  return cleanState;
};

const updateState = async (oldState, newState) => {
  const cleanOldState = normalizeTextValue(oldState, "Current state");
  const cleanNewState = normalizeTextValue(newState, "New state");
  const states = await Master.findOne({ type: "states" });
  const cities = await Master.findOne({ type: "citiesByState" });
  if (!states) throw notFound('Master "states" not found');

  const values = normalizeList(states.values, "States");
  const index = values.findIndex((item) => item.toLowerCase() === cleanOldState.toLowerCase());
  if (index === -1) throw notFound(`State "${cleanOldState}" not found`);
  if (values.some((item, itemIndex) => itemIndex !== index && item.toLowerCase() === cleanNewState.toLowerCase())) {
    throw badRequest(`State "${cleanNewState}" already exists`);
  }

  const actualOldState = values[index];
  values[index] = cleanNewState;
  states.values = values.sort();
  states.markModified("values");
  await states.save();

  if (cities && isPlainObject(cities.values)) {
    cities.values = {
      ...cities.values,
      [cleanNewState]: cities.values[actualOldState] || [],
    };
    delete cities.values[actualOldState];
    cities.markModified("values");
    await cities.save();
  }

  return cleanNewState;
};

const deleteState = async (state) => {
  const cleanState = normalizeTextValue(state, "State");
  const states = await Master.findOne({ type: "states" });
  if (!states) throw notFound('Master "states" not found');

  const values = normalizeList(states.values, "States");
  const actualState = values.find((item) => item.toLowerCase() === cleanState.toLowerCase());
  if (!actualState) throw notFound(`State "${cleanState}" not found`);

  states.values = values.filter((item) => item !== actualState);
  states.markModified("values");
  await states.save();

  const cities = await Master.findOne({ type: "citiesByState" });
  if (cities && isPlainObject(cities.values)) {
    delete cities.values[actualState];
    cities.markModified("values");
    await cities.save();
  }
};

const addCity = async (state, city) => {
  const cleanState = normalizeTextValue(state, "State");
  const cleanCity = normalizeTextValue(city, "City");
  const citiesMaster = await Master.findOne({ type: "citiesByState" });
  if (!citiesMaster || !isPlainObject(citiesMaster.values)) {
    throw notFound('Master "citiesByState" not found');
  }

  const actualState = Object.keys(citiesMaster.values).find(
    (key) => key.toLowerCase() === cleanState.toLowerCase()
  );
  if (!actualState) throw notFound(`State "${cleanState}" not found`);

  const values = normalizeList(citiesMaster.values[actualState], `Cities of ${actualState}`);
  const exists = values.some((item) => item.toLowerCase() === cleanCity.toLowerCase());
  if (!exists) {
    citiesMaster.values = { ...citiesMaster.values, [actualState]: [...values, cleanCity].sort() };
    citiesMaster.markModified("values");
    await citiesMaster.save();
  }
  return cleanCity;
};

const updateCity = async (state, oldCity, newCity) => {
  const cleanState = normalizeTextValue(state, "State");
  const cleanOldCity = normalizeTextValue(oldCity, "Current city");
  const cleanNewCity = normalizeTextValue(newCity, "New city");
  const citiesMaster = await Master.findOne({ type: "citiesByState" });
  if (!citiesMaster || !isPlainObject(citiesMaster.values)) {
    throw notFound('Master "citiesByState" not found');
  }

  const actualState = Object.keys(citiesMaster.values).find(
    (key) => key.toLowerCase() === cleanState.toLowerCase()
  );
  if (!actualState) throw notFound(`State "${cleanState}" not found`);

  const values = normalizeList(citiesMaster.values[actualState], `Cities of ${actualState}`);
  const index = values.findIndex((item) => item.toLowerCase() === cleanOldCity.toLowerCase());
  if (index === -1) throw notFound(`City "${cleanOldCity}" not found in ${actualState}`);
  if (values.some((item, itemIndex) => itemIndex !== index && item.toLowerCase() === cleanNewCity.toLowerCase())) {
    throw badRequest(`City "${cleanNewCity}" already exists in ${actualState}`);
  }

  values[index] = cleanNewCity;
  citiesMaster.values = { ...citiesMaster.values, [actualState]: values.sort() };
  citiesMaster.markModified("values");
  await citiesMaster.save();
  return cleanNewCity;
};

const deleteCity = async (state, city) => {
  const cleanState = normalizeTextValue(state, "State");
  const cleanCity = normalizeTextValue(city, "City");
  const citiesMaster = await Master.findOne({ type: "citiesByState" });
  if (!citiesMaster || !isPlainObject(citiesMaster.values)) {
    throw notFound('Master "citiesByState" not found');
  }

  const actualState = Object.keys(citiesMaster.values).find(
    (key) => key.toLowerCase() === cleanState.toLowerCase()
  );
  if (!actualState) throw notFound(`State "${cleanState}" not found`);

  const values = normalizeList(citiesMaster.values[actualState], `Cities of ${actualState}`);
  const remaining = values.filter((item) => item.toLowerCase() !== cleanCity.toLowerCase());
  if (remaining.length === values.length) throw notFound(`City "${cleanCity}" not found in ${actualState}`);

  citiesMaster.values = { ...citiesMaster.values, [actualState]: remaining };
  citiesMaster.markModified("values");
  await citiesMaster.save();
};

/*
==========================================
List all masters (summary view — no full values payload).
==========================================
*/
const listMasters = async () => {
  const masters = await Master.find().sort({ label: 1 });

  return masters.map((m) => {
    const kind = getKind(m.values);
    const count =
      kind === "list"
        ? m.values.length
        : kind === "grouped"
        ? Object.keys(m.values).length
        : 0;

    return {
      _id: m._id,
      type: m.type,
      label: m.label,
      kind,
      count,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  });
};

const getMasterById = async (id) => {
  const master = await Master.findById(id);
  if (!master) throw notFound("Master not found");
  return master;
};

/*
Location masters are grouped stores — when created without explicit values
they must start as {} (not []), otherwise the first grouped write gets
rejected as a shape switch.
==========================================
*/
const GROUPED_DEFAULT_TYPES = new Set(["citiesByState", "statesByCountry", "pincodesByCity"]);
const defaultValuesForType = (type) => (GROUPED_DEFAULT_TYPES.has(type) ? {} : []);

const createMaster = async ({ type, label, values }) => {
  const cleanType = normalizeType(type);
  const cleanValues = values === undefined ? defaultValuesForType(cleanType) : normalizeValues(values);

  const existing = await Master.findOne({ type: cleanType });
  if (existing) {
    if (cleanType !== "banks") {
      throw badRequest(`Master type "${cleanType}" already exists`);
    }

    if (getKind(existing.values) !== "list" || getKind(cleanValues) !== "list") {
      throw badRequest('Master "banks" must contain a flat list');
    }

    const mergedValues = [...existing.values];
    for (const value of cleanValues) {
      if (!mergedValues.some((item) => String(item).toLowerCase() === String(value).toLowerCase())) {
        mergedValues.push(value);
      }
    }

    existing.values = mergedValues;
    existing.markModified("values");
    await existing.save();
    return existing;
  }

  const cleanLabel = normalizeLabel(label);

  const master = await Master.create({
    type: cleanType,
    label: cleanLabel,
    values: cleanValues,
  });

  return master;
};

const addCustomValue = async ({ type, value }) => {
  const cleanType = normalizeType(type);
  const cleanValue = String(value ?? "").trim();

  if (!cleanValue) {
    throw badRequest("Value is required");
  }

  let master = await Master.findOne({ type: cleanType });

  if (!master) {
    master = await Master.create({
      type: cleanType,
      label:
        cleanType === BANK_MASTER_TYPE
          ? BANK_MASTER_LABEL
          : cleanType
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/[_-]+/g, " ")
              .trim() || cleanType,
      values: [cleanValue],
    });

    return master;
  }

  if (getKind(master.values) !== "list") {
    throw badRequest(`Master type "${cleanType}" is grouped and cannot accept a custom single value`);
  }

  master.values = appendUniqueValue(master.values, cleanValue);
  await master.save();

  return master;
};

/*
==========================================
BANKS

Banks live in ONE master: type "banks", label "Banks". The bank APIs below
never ask the admin for type/label, so there is nothing to mistype and no
way to accidentally create a duplicate "Bank01" / "bank01" style master.

Legacy masters whose type starts with "bank" (bank01, Bank01, bankLoan) are
still READ so no bank name silently disappears from the dropdowns — they just
should not be created any more. Delete them from the admin panel and the
merged list becomes the "banks" master alone.
==========================================
*/
const BANK_MASTER_TYPE = "banks";
const BANK_MASTER_LABEL = "Banks";
const BANK_TYPE_REGEX = /^bank/i;

const isBankType = (type) => BANK_TYPE_REGEX.test(String(type ?? ""));

const collectBankNames = (masters) => {
  const seen = new Set();
  const banks = [];

  masters
    .filter((master) => isBankType(master.type))
    .forEach((master) => {
      const values = Array.isArray(master.values) ? master.values : [];
      values.forEach((value) => {
        const name = String(value ?? "").trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        banks.push(name);
      });
    });

  return banks;
};

/* Every bank name the app knows about, de-duplicated. */
const getBankNames = async () => {
  const masters = await Master.find({ type: BANK_TYPE_REGEX });
  return collectBankNames(masters);
};

/* The one canonical master every bank WRITE goes to (created on demand). */
const getBankMaster = async () => {
  let master = await Master.findOne({ type: BANK_MASTER_TYPE });

  if (!master) {
    master = await Master.create({
      type: BANK_MASTER_TYPE,
      label: BANK_MASTER_LABEL,
      values: [],
    });
  } else if (master.label !== BANK_MASTER_LABEL) {
    // The "banks" master is created lazily by many flows — keep its label
    // canonical ("Banks") no matter which flow created it first.
    master.label = BANK_MASTER_LABEL;
    await master.save();
  }

  return master;
};

/*
Accepts any of these, so the admin UI can post whichever is handy:
  ["HDFC Bank", "ICICI Bank"]
  { "banks": [...] }
  { "values": [...] }
  { "value": "HDFC Bank" }
Duplicates are dropped silently instead of being an error.
==========================================
*/
const toBankNameList = (input) => {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) return input;

  if (typeof input === "object") {
    const key = ["banks", "values", "names", "bank", "value"].find(
      (candidate) => input[candidate] !== undefined
    );
    return key ? toBankNameList(input[key]) : [];
  }

  return [input];
};

const cleanBankNames = (input, label = "Bank name") => {
  const seen = new Set();
  const names = [];

  toBankNameList(input).forEach((raw) => {
    const name = String(raw ?? "").trim();
    if (!name) return;
    if (name.length > 150) {
      throw badRequest(`${label} "${name}" is too long (max 150 characters)`);
    }
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(name);
  });

  return names;
};

/* Add banks — existing names are skipped, new ones appended. */
const addBanks = async (input) => {
  const names = cleanBankNames(input);

  if (!names.length) {
    throw badRequest("At least one bank name is required");
  }

  const master = await getBankMaster();
  let values = Array.isArray(master.values) ? master.values : [];

  names.forEach((name) => {
    values = appendUniqueValue(values, name);
  });

  master.values = values;
  master.markModified("values");
  await master.save();

  return master;
};

/* Replace the whole bank list in one shot. */
const replaceBanks = async (input) => {
  const master = await getBankMaster();

  master.values = cleanBankNames(input);
  master.markModified("values");
  await master.save();

  return master;
};

/* Rename one bank in place (Bank Details page), case-insensitive match. */
const renameBank = async (oldName, newName) => {
  const cleanOld = String(oldName ?? "").trim();
  const cleanNew = String(newName ?? "").trim();

  if (!cleanOld) throw badRequest("Current bank name is required");
  if (!cleanNew) throw badRequest("New bank name is required");
  if (cleanNew.length > 150) {
    throw badRequest(`Bank name "${cleanNew}" is too long (max 150 characters)`);
  }

  const master = await getBankMaster();
  const values = Array.isArray(master.values) ? master.values : [];
  const index = values.findIndex(
    (item) => String(item ?? "").trim().toLowerCase() === cleanOld.toLowerCase()
  );
  if (index === -1) throw notFound(`Bank "${cleanOld}" not found`);

  const duplicate = values.some(
    (item, itemIndex) =>
      itemIndex !== index &&
      String(item ?? "").trim().toLowerCase() === cleanNew.toLowerCase()
  );
  if (duplicate) throw badRequest(`Bank "${cleanNew}" already exists`);

  values[index] = cleanNew;
  master.values = values;
  master.markModified("values");
  await master.save();

  return master;
};

/* Remove a single bank by name. */
const deleteBank = async (name) => {
  const cleanName = String(name ?? "").trim();
  if (!cleanName) throw badRequest("Bank name is required");

  const master = await Master.findOne({ type: BANK_MASTER_TYPE });
  if (!master) throw notFound('Master "banks" not found');

  const values = Array.isArray(master.values) ? master.values : [];
  const remaining = values.filter(
    (item) => String(item ?? "").trim().toLowerCase() !== cleanName.toLowerCase()
  );

  if (remaining.length === values.length) {
    throw notFound(`Bank "${cleanName}" not found`);
  }

  master.values = remaining;
  master.markModified("values");
  await master.save();

  return cleanName;
};

/*
==========================================
Only the label is editable after creation — "type" is the key every
public loan form fetches this list by, so renaming it here would
silently break live dropdowns.
==========================================
*/
const updateMasterLabel = async (id, label) => {
  const cleanLabel = normalizeLabel(label);

  const master = await Master.findById(id);
  if (!master) throw notFound("Master not found");

  master.label = cleanLabel;
  await master.save();

  return master;
};

/*
Empty values ([] / {}) hold no data, so switching their shape is lossless.
This is what lets a master seeded as [] (e.g. statesByCountry) grow into a
grouped store the first time the admin Location page writes to it.
==========================================
*/
const isEmptyValues = (values) =>
  values === undefined ||
  values === null ||
  (Array.isArray(values) && values.length === 0) ||
  (isPlainObject(values) && Object.keys(values).length === 0);

const replaceMasterValues = async (id, values) => {
  const master = await Master.findById(id);
  if (!master) throw notFound("Master not found");

  const existingKind = getKind(master.values);
  const cleanValues = normalizeValues(values);
  const newKind = getKind(cleanValues);

  if (
    existingKind !== "unknown" &&
    existingKind !== newKind &&
    !isEmptyValues(master.values)
  ) {
    throw badRequest(
      `"${master.label}" stores a ${existingKind === "list" ? "flat list" : "grouped list"} — cannot switch shape`
    );
  }

  master.values = cleanValues;
  master.markModified("values");
  await master.save();

  return master;
};

const deleteMaster = async (id) => {
  const master = await Master.findById(id);
  if (!master) throw notFound("Master not found");

  await master.deleteOne();

  return master;
};

module.exports = {
  listMasters,
  getMasterById,
  createMaster,
  addCustomValue,
  updateMasterLabel,
  replaceMasterValues,
  deleteMaster,
  getKind,
  appendUniqueValue,
  BANK_MASTER_TYPE,
  BANK_MASTER_LABEL,
  isBankType,
  getBankNames,
  getBankMaster,
  addBanks,
  replaceBanks,
  renameBank,
  deleteBank,
  getStates,
  getCitiesByState,
  addState,
  updateState,
  deleteState,
  addCity,
  updateCity,
  deleteCity,
  getPincodesForCity,
  listPincodeLocations,
  PINCODES_MASTER_TYPE,
};
