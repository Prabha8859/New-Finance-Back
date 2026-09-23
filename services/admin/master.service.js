const Master = require("../../models/Master");

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

const createMaster = async ({ type, label, values }) => {
  const cleanType = normalizeType(type);
  const cleanLabel = normalizeLabel(label);
  const cleanValues = values === undefined ? [] : normalizeValues(values);

  const existing = await Master.findOne({ type: cleanType });
  if (existing) throw badRequest(`Master type "${cleanType}" already exists`);

  const master = await Master.create({
    type: cleanType,
    label: cleanLabel,
    values: cleanValues,
  });

  return master;
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

const replaceMasterValues = async (id, values) => {
  const master = await Master.findById(id);
  if (!master) throw notFound("Master not found");

  const existingKind = getKind(master.values);
  const cleanValues = normalizeValues(values);
  const newKind = getKind(cleanValues);

  if (existingKind !== "unknown" && existingKind !== newKind) {
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
  updateMasterLabel,
  replaceMasterValues,
  deleteMaster,
  getKind,
};
