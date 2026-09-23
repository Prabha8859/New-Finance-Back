require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Master = require("../models/Master");
const pincodeData = require("india-pincode-lookup/pincodes.json");

/*
==========================================
Builds the "pincodesByLocation" master: a grouped list of pincodes keyed by
`${slug(state)}::${slug(city)}`, matched against the existing "states" /
"citiesByState" masters already in the DB.

Pincode source data (India Post, via data.gov.in / india-pincode-lookup) is
organized by post office (officeName), taluk, and district — not by the
city/town names our states+citiesByState masters use — and predates a few
state boundary changes (no separate Telangana or Ladakh, some states
misspelled or using "&"). STATE_ALIASES below maps our current state names
to the dataset's (possibly old/differently-spelled) state name(s).

Matching a city to pincodes tries, per state, in order: exact district name,
then exact taluk name, then exact post-office name (tags like "S.O"/"B.O"
stripped). Cities with no match simply get no entry — the frontend falls
back to a plain "Other" pincode entry for those.
==========================================
*/

const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const normOffice = (s) => {
  let x = String(s ?? "").trim().toLowerCase();
  x = x.replace(/\s*\(.*?\)\s*/g, " ");
  x = x.replace(/\b(s\.?o|b\.?o|h\.?o|sub office|head office|branch office)\b\.?/g, " ");
  return x.replace(/[^a-z0-9]/g, "");
};

const slug = (s) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const STATE_ALIASES = {
  "andaman and nicobar islands": ["andaman & nicobar islands"],
  "chhattisgarh": ["chattisgarh"],
  "dadra and nagar haveli and daman and diu": ["dadra & nagar haveli", "daman & diu"],
  "jammu and kashmir": ["jammu & kashmir"],
  "ladakh": ["jammu & kashmir"],
  "puducherry": ["pondicherry"],
  "telangana": ["andhra pradesh"],
};

const buildStateBuckets = () => {
  const byState = new Map();
  for (const rec of pincodeData) {
    const ns = norm(rec.stateName);
    if (!byState.has(ns)) byState.set(ns, { districts: new Map(), taluks: new Map(), offices: new Map() });
    const bucket = byState.get(ns);
    const pin = String(rec.pincode);

    const nd = norm(rec.districtName);
    if (!bucket.districts.has(nd)) bucket.districts.set(nd, new Set());
    bucket.districts.get(nd).add(pin);

    const nt = norm(rec.taluk);
    if (!bucket.taluks.has(nt)) bucket.taluks.set(nt, new Set());
    bucket.taluks.get(nt).add(pin);

    const no = normOffice(rec.officeName);
    if (!bucket.offices.has(no)) bucket.offices.set(no, new Set());
    bucket.offices.get(no).add(pin);
  }
  return byState;
};

const getBuckets = (byState, stateName) => {
  const ns = norm(stateName);
  if (byState.has(ns)) return [byState.get(ns)];
  const aliases = STATE_ALIASES[String(stateName).trim().toLowerCase()];
  if (!aliases) return [];
  return aliases.map((a) => byState.get(norm(a))).filter(Boolean);
};

const buildPincodesByLocation = (states, citiesByState) => {
  const byState = buildStateBuckets();
  const result = {};
  let matched = 0;
  let total = 0;

  for (const state of states) {
    const buckets = getBuckets(byState, state);
    const cities = citiesByState[state] || [];
    for (const city of cities) {
      total++;
      const nc = norm(city);
      const noc = normOffice(city);
      let pins = null;
      for (const b of buckets) { if (b.districts.has(nc)) { pins = b.districts.get(nc); break; } }
      if (!pins) for (const b of buckets) { if (b.taluks.has(nc)) { pins = b.taluks.get(nc); break; } }
      if (!pins) for (const b of buckets) { if (b.offices.has(noc)) { pins = b.offices.get(noc); break; } }
      if (pins) {
        result[`${slug(state)}::${slug(city)}`] = [...pins].sort();
        matched++;
      }
    }
  }

  return { result, matched, total };
};

const run = async () => {
  await connectDB();

  const statesDoc = await Master.findOne({ type: "states" });
  const citiesDoc = await Master.findOne({ type: "citiesByState" });

  if (!statesDoc || !citiesDoc) {
    throw new Error('Run "npm run seed:masters" first — "states" and "citiesByState" masters are required.');
  }

  const { result, matched, total } = buildPincodesByLocation(statesDoc.values, citiesDoc.values);

  await Master.findOneAndUpdate(
    { type: "pincodesByLocation" },
    { type: "pincodesByLocation", label: "Pincodes by Location", values: result },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("=================================");
  console.log(`✓ Seeded master: pincodesByLocation`);
  console.log(`  Matched ${matched}/${total} cities (${((matched / total) * 100).toFixed(1)}%)`);
  console.log(`  ${total - matched} cities have no pincode list and will fall back to "Other" in the form.`);
  console.log("=================================");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Failed to seed pincodesByLocation:", error.message);
  process.exit(1);
});
