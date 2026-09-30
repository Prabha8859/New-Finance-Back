require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const connectDB = require("../src/config/database");
const { Country: CscCountry, State: CscState, City: CscCity } = require("country-state-city");
const indiaPincodes = require("india-pincode-lookup/pincodes.json");

const Continent = require("../src/modules/location/models/continent.model");
const Country = require("../src/modules/location/models/country.model");
const State = require("../src/modules/location/models/state.model");
const City = require("../src/modules/location/models/city.model");
const Pincode = require("../src/modules/location/models/pincode.model");
const { LOCATION_STATUS } = require("../src/modules/location/location.constants");
const { slugFor } = require("../src/modules/location/location.service");

/*
==========================================
Location Master importer — admin ke haath se ek bhi pincode nahi.

Ye script already-installed datasets se poora Continent -> Country -> State ->
City -> Pincode chain bana deti hai:

  country-state-city      -> duniya ke 250 countries + unke states/cities
  india-pincode-lookup    -> 19,097 unique Indian pincodes (154,823 post
                             offices) with district + state

Usage:
  npm run import:location                       # India (default)
  npm run import:location -- --countries=all    # poori duniya
  npm run import:location -- --countries=IN,AE
  npm run import:location -- --states=goa       # sirf kuch Indian states
  npm run import:location -- --skip-cities --skip-pincodes
  npm run import:location -- --dry-run           # kuch bhi save na karo

Idempotent: dobara chalane par duplicate nahi banega, aur admin ne jo row
manually deactivate ki hai wo deactivated hi rahegi ($setOnInsert).

Cities = India Post DISTRICTS. Ye jaan-boojh kar hai: har pincode ko ek city
mil jaati hai, isliye pincode lookup 100% match karta hai aur koi fuzzy
name-matching nahi chahiye. Zyada towns chahiye to admin panel se add karo.
==========================================
*/

/* ---------- args ---------- */

const args = process.argv.slice(2);

const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const has = (name) => args.includes(`--${name}`);

const COUNTRIES = flag("countries", "IN");
const STATE_FILTER = flag("states", "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const SKIP_PINCODES = has("skip-pincodes");
const SKIP_CITIES = has("skip-cities");
const DRY_RUN = has("dry-run");
const STATUS = flag("status", LOCATION_STATUS.ACTIVE);

/* ---------- helpers ---------- */

const MINOR_WORDS = new Set(["and", "of", "the", "in", "on", "for"]);

const titleCase = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && MINOR_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

/* ---------- continents ---------- */

/*
country-state-city me continent ka field nahi hai, isliye ISO -> continent
map yahan hai. Jo code map me nahi milega, script usse "Other" me daalegi aur
summary me warn karegi — kuch bhi chupke se galat jagah nahi jaata.
*/
const CONTINENT_BY_ISO = (() => {
  const groups = {
    Africa:
      "DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW EH YT RE SH",
    Asia:
      "AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KP KR KW KG LA LB MY MV MN MM NP OM PK PH QA SA SG LK SY TJ TH TL TR TM AE UZ VN YE HK MO TW PS IO",
    Europe:
      "AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA GI FO GG IM JE SJ AX XK",
    "North America":
      "AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US AI AW BM BQ VG KY CW GL GP MQ MS PR BL MF PM SX TC VI",
    "South America": "AR BO BR CL CO EC GY PY PE SR UY VE FK GF GS",
    Oceania:
      "AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU AS CK GU NC NU NF MP PN PF TK UM WF CX CC",
    Antarctica: "AQ BV HM TF",
  };

  const map = new Map();
  for (const [continent, codes] of Object.entries(groups)) {
    codes.split(/\s+/).filter(Boolean).forEach((code) => map.set(code, continent));
  }
  return map;
})();

/* ---------- India-specific naming ---------- */

const INDIA_ISO = "IN";

/* India Post dataset purane naam/shape use karta hai — canonical naam. */
const STATE_RENAMES = {
  "andaman & nicobar islands": "Andaman and Nicobar Islands",
  chattisgarh: "Chhattisgarh",
  pondicherry: "Puducherry",
  "dadra & nagar haveli": "Dadra and Nagar Haveli",
  "daman & diu": "Daman and Diu",
  "jammu & kashmir": "Jammu and Kashmir",
};

/*
Dataset me Telangana alag state nahi hai — uske districts ANDHRA PRADESH ke
neeche hain. Ye list unhe Telangana me daalti hai, isliye 500001 -> Telangana.
*/
const TELANGANA_DISTRICTS = new Set([
  "adilabad",
  "hyderabad",
  "k.v.rangareddy",
  "karim nagar",
  "khammam",
  "mahabub nagar",
  "medak",
  "nalgonda",
  "nizamabad",
  "warangal",
]);

const DISTRICT_RENAMES = {
  ananthapur: "Anantapur",
  cuddapah: "Kadapa",
  "k.v.rangareddy": "Rangareddy",
  "karim nagar": "Karimnagar",
  "mahabub nagar": "Mahbubnagar",
  bangalore: "Bengaluru",
  mysore: "Mysuru",
  mangalore: "Mangaluru",
};

const canonicalState = (rawState) =>
  STATE_RENAMES[String(rawState).trim().toLowerCase()] || titleCase(rawState);

const stateForRecord = (record) => {
  const district = String(record.districtName ?? "").trim().toLowerCase();
  const state = String(record.stateName ?? "").trim().toUpperCase();

  if (state === "ANDHRA PRADESH" && TELANGANA_DISTRICTS.has(district)) return "Telangana";

  return canonicalState(record.stateName);
};

const canonicalDistrict = (rawDistrict) =>
  DISTRICT_RENAMES[String(rawDistrict).trim().toLowerCase()] || titleCase(rawDistrict);

/* ---------- upsert helpers (idempotent) ---------- */

const counters = {
  continents: 0,
  countries: 0,
  states: 0,
  cities: 0,
  pincodes: 0,
};

const slugCache = new Map();

const upsert = async (Model, filter, insert) => {
  if (DRY_RUN) return { _id: `dry:${JSON.stringify(filter)}`, ...insert };

  const doc = await Model.findOneAndUpdate(
    filter,
    { $setOnInsert: { ...insert, status: STATUS } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return doc;
};

const upsertContinent = async (name) => {
  const key = `continent:${name}`;
  if (slugCache.has(key)) return slugCache.get(key);

  const slug = slugFor(name);
  const doc = await upsert(Continent, { slug }, { name, slug });
  slugCache.set(key, doc._id);
  counters.continents += 1;
  return doc._id;
};

const upsertCountry = async (name, continentId, isoCode) => {
  const key = `country:${continentId}:${isoCode || slugFor(name)}`;
  if (slugCache.has(key)) return slugCache.get(key);

  const slug = slugFor(name);
  /* isoCode is stored (B2) so the master carries real ISO codes, and the
     upsert also backfills it on re-runs against pre-existing rows. */
  const doc = await upsert(
    Country,
    { continentId, slug },
    { name, slug, continentId, isoCode: isoCode || "" }
  );
  slugCache.set(key, doc._id);
  counters.countries += 1;
  return doc._id;
};

const upsertState = async (name, countryId) => {
  const key = `state:${countryId}:${slugFor(name)}`;
  if (slugCache.has(key)) return slugCache.get(key);

  const slug = slugFor(name);
  const doc = await upsert(State, { countryId, slug }, { name, slug, countryId });
  slugCache.set(key, doc._id);
  counters.states += 1;
  return doc._id;
};

const upsertCity = async (name, stateId) => {
  const key = `city:${stateId}:${slugFor(name)}`;
  if (slugCache.has(key)) return slugCache.get(key);

  const slug = slugFor(name);
  const doc = await upsert(City, { stateId, slug }, { name, slug, stateId });
  slugCache.set(key, doc._id);
  counters.cities += 1;
  return doc._id;
};

const insertPincodes = async (rows) => {
  const CHUNK = 1000;

  for (let index = 0; index < rows.length; index += CHUNK) {
    const chunk = rows.slice(index, index + CHUNK);

    if (DRY_RUN) {
      counters.pincodes += chunk.length;
      continue;
    }

    const operations = chunk.map((row) => ({
      updateOne: {
        filter: { pincode: row.pincode, countryId: row.countryId },
        update: {
          $setOnInsert: {
            countryId: row.countryId,
            stateId: row.stateId,
            cityId: row.cityId,
            pincode: row.pincode,
            prefix: row.prefix,
            status: STATUS,
          },
        },
        upsert: true,
      },
    }));

    const result = await Pincode.bulkWrite(operations, { ordered: false });
    counters.pincodes += (result.upsertedCount || 0) + (result.modifiedCount || 0);
  }
};

const progress = (done, total, label) => {
  if (done % 25 === 0 || done === total) {
    console.log(`   ${label}: ${done}/${total}`);
  }
};

/* ---------- India ---------- */

const importIndia = async ({ withPincodes }) => {
  console.log("\n🇮🇳 India");

  const continentId = await upsertContinent("Asia");
  const countryId = await upsertCountry("India", continentId, INDIA_ISO);

  /* state -> district -> pincodes */
  const groups = new Map();

  /*
  Ek pincode exactly ek hi city me jaana chahiye, warna lookup (findOne)
  non-deterministic ho jaata. Dataset me kuch pincodes do districts me repeat
  hote hain — pehla jeetta hai.
  */
  const assigned = new Map();
  let skipped = 0;

  for (const record of indiaPincodes) {
    const stateName = stateForRecord(record);

    if (STATE_FILTER.length && !STATE_FILTER.includes(stateName.toLowerCase())) continue;

    const districtName = canonicalDistrict(record.districtName);
    const pincode = String(record.pincode).trim();

    if (assigned.has(pincode)) {
      skipped += 1;
      continue;
    }
    assigned.set(pincode, `${stateName}::${districtName}`);

    if (!groups.has(stateName)) groups.set(stateName, new Map());
    const districts = groups.get(stateName);

    if (!districts.has(districtName)) districts.set(districtName, new Set());
    districts.get(districtName).add(pincode);
  }

  if (skipped) console.log(`   ${skipped} duplicate post-office rows skipped`);

  console.log(`   ${groups.size} states (${[...groups.keys()].sort().join(", ")})`);

  const pincodeRows = [];

  for (const [stateName, districts] of groups) {
    const stateId = await upsertState(stateName, countryId);

    for (const [districtName, pincodes] of districts) {
      const cityId = SKIP_CITIES ? null : await upsertCity(districtName, stateId);

      if (!withPincodes || SKIP_PINCODES) continue;

      if (!cityId) continue;

      for (const pincode of pincodes) {
        pincodeRows.push({
          countryId,
          stateId,
          cityId,
          pincode,
          prefix: pincode.slice(0, 3),
        });
      }
    }
  }

  console.log(`   ${pincodeRows.length} pincode rows ready`);
  await insertPincodes(pincodeRows);
};

/* ---------- rest of the world ---------- */

const importWorld = async () => {
  const all = CscCountry.getAllCountries();

  const wanted =
    COUNTRIES.toLowerCase() === "all"
      ? all
      : all.filter((country) => COUNTRIES.split(",").includes(country.isoCode));

  const unmapped = new Set();

  console.log(`\n🌍 Countries (${wanted.length})`);

  let done = 0;

  for (const country of wanted) {
    if (country.isoCode === INDIA_ISO) continue;

    const continentName = CONTINENT_BY_ISO.get(country.isoCode);
    if (!continentName) unmapped.add(country.isoCode);

    const continentId = await upsertContinent(continentName || "Other");
    const countryId = await upsertCountry(country.name, continentId, country.isoCode);

    for (const state of CscState.getStatesOfCountry(country.isoCode)) {
      const stateId = await upsertState(state.name, countryId);

      if (SKIP_CITIES) continue;

      for (const city of CscCity.getCitiesOfState(country.isoCode, state.isoCode)) {
        await upsertCity(city.name, stateId);
      }
    }

    done += 1;
    progress(done, wanted.length, "countries");
  }

  if (unmapped.size) {
    console.log(`\n⚠️  No continent mapping for: ${[...unmapped].sort().join(", ")}`);
    console.log('   (in sab ko "Other" continent me daala gaya — map me add kar sakte ho)');
  }
};

/* ---------- main ---------- */

const run = async () => {
  await connectDB();

  console.log("=========================================");
  console.log(" Location Master import");
  console.log(` countries: ${COUNTRIES}${SKIP_PINCODES ? " | pincodes: skipped" : ""}${DRY_RUN ? " | DRY RUN" : ""}`);
  console.log("=========================================");

  const wantsIndia = COUNTRIES.toLowerCase() === "all" || COUNTRIES.split(",").includes(INDIA_ISO);

  if (wantsIndia) {
    await importIndia({ withPincodes: !SKIP_PINCODES });
  }

  if (COUNTRIES.toLowerCase() === "all" || !wantsIndia) {
    await importWorld();
  }

  const [totalContinents, totalCountries, totalStates, totalCities, totalPincodes] = DRY_RUN
    ? [counters.continents, counters.countries, counters.states, counters.cities, counters.pincodes]
    : await Promise.all([
        Continent.countDocuments(),
        Country.countDocuments(),
        State.countDocuments(),
        City.countDocuments(),
        Pincode.countDocuments(),
      ]);

  console.log("\n=========================================");
  console.log(DRY_RUN ? " DRY RUN — kuch bhi save nahi hua" : " ✅ Import complete");
  console.log(`   continents: ${totalContinents}`);
  console.log(`   countries : ${totalCountries}`);
  console.log(`   states    : ${totalStates}`);
  console.log(`   cities    : ${totalCities}`);
  console.log(`   pincodes  : ${totalPincodes}`);
  console.log("=========================================");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (error) => {
  console.error("❌ Location import failed:", error.message);
  console.error(error.stack);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
