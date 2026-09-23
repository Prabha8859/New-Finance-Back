require("dotenv").config();

const mongoose = require("mongoose");
const { State, City } = require("country-state-city");
const connectDB = require("../config/db");
const Master = require("../models/Master");

const OTHER_OPTION = "Other";

const indiaStates = State.getStatesOfCountry("IN");
const STATE_NAMES = indiaStates.map((s) => s.name).sort();

const cleanCityName = (raw) => raw.trim().replace(/[,.;:]+$/, "").replace(/\s{2,}/g, " ").trim();

const dedupeCities = (names) => {
  const seen = new Map();
  for (const raw of names) {
    const cleaned = cleanCityName(raw);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    const existing = seen.get(key);
    if (!existing || raw.length < existing.rawLength) {
      seen.set(key, { name: cleaned, rawLength: raw.length });
    }
  }
  return [...seen.values()].map((v) => v.name).sort();
};

const CITIES_BY_STATE = {};
for (const state of indiaStates) {
  const rawCities = City.getCitiesOfState("IN", state.isoCode).map((c) => c.name);
  CITIES_BY_STATE[state.name] = dedupeCities(rawCities);
}

const MASTERS_SEED = [
  {
    type: "states",
    label: "Indian States",
    values: STATE_NAMES,
  },
  {
    type: "citiesByState",
    label: "Cities by State",
    values: CITIES_BY_STATE,
  },
  {
    type: "banks",
    label: "Banks",
    values: [
      "HDFC", "SBI", "Bank Of India", "ICICI", "Punjab National Bank",
      "Kotak Mahindra Bank", "AXIS", "Citibank", OTHER_OPTION,
    ],
  },
  {
    type: "existingLoanTypes",
    label: "Existing Loan Types",
    values: [
      "Personal loan", "Business loan", "Home loan", "Car loan", "Working Capital",
      "Project Loan", "OD/CC", "Loan against share", "Gold loan", OTHER_OPTION,
    ],
  },
  {
    type: "residenceStatuses",
    label: "Residence Statuses",
    values: [
      "Owned by self", "Owned by spouse", "Owned by parents", "Rented with siblings",
      "Rented with family", "Rent and stay alone", "Paying Guest", "Hostel",
      "Company Provided", OTHER_OPTION,
    ],
  },
  {
    type: "salaryModes",
    label: "Salary Modes",
    values: [
      "Cash", "Cheque", "Electronically deposited-IMPS", "Electronically deposited-NFT/RTGS",
    ],
  },
  {
    type: "companyTypes",
    label: "Company Types",
    values: ["Private Limited", "Limited", "Partnership", "Proprietorship", "Government", OTHER_OPTION],
  },
  {
    type: "businessTypes",
    label: "Business Types",
    values: [
      "Proprietorship", "Partnership Firm", "Privated Limited Company", "Public Limited Company",
      "Limited Liability Company", OTHER_OPTION,
    ],
  },
  {
    type: "natureOfBusiness",
    label: "Nature Of Business",
    values: ["Manufacture", "Trader/Wholesaler", "Retailer", "Service Provider", OTHER_OPTION],
  },
  {
    type: "industryTypes",
    label: "Industry Types",
    values: [
      "Agriculture", "Automobiles", "Cement", "Chemical", "Computer", "Construction",
      "Consumer Durables", "Container & Packaging", "Durables", "Energy", "Food & Beverages",
      "Hardware Equipments", "Healthcare", "Household Products", "Industrial Projects", "Metals",
      "Paper", "Petroleum Products", "Plastic", "Rubber", "Textiles", OTHER_OPTION,
    ],
  },
  {
    type: "businessPlaceStatuses",
    label: "Status Of Business Place",
    values: ["Owned", "Rented", "Leased", "Shared", OTHER_OPTION],
  },
  {
    type: "professions",
    label: "Professions",
    values: ["Doctor", "Chartered Accountant", "Lawyer", "Architect", "Company Secretary", "Consultant", "Engineer", OTHER_OPTION],
  },
  {
    type: "personalEmploymentTypes",
    label: "Personal Loan - Employment Types",
    values: ["Salaried"],
  },
  {
    type: "businessEmploymentTypes",
    label: "Business Loan - Employment Types",
    values: ["Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "homeEmploymentTypes",
    label: "Home Loan - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "loanAgainstPropertyEmploymentTypes",
    label: "Loan Against Property - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "workingCapitalEmploymentTypes",
    label: "Working Capital - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "leaseRentalEmploymentTypes",
    label: "Lease Rental Discounting - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "odCcEmploymentTypes",
    label: "OD CC Limit - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "odCcLimitAgainstTypes",
    label: "OD CC Limit - Wish To Take Limit Against",
    values: ["Residential Property", "Commercial Property", "Industrial Property", "Unsecured", OTHER_OPTION],
  },
  {
    type: "loanAgainstShareEmploymentTypes",
    label: "Loan Against Share - Employment Types",
    values: ["Salaried", "Self Employed - Business", "Self Employed - Professional"],
  },
  {
    type: "buyingPropertyTypes",
    label: "Buying Property Types",
    values: ["New", "Under-construction", "Old-construction", OTHER_OPTION],
  },
  {
    type: "collateralPropertyTypes",
    label: "Collateral Property Types",
    values: ["Residential Property", "Commercial Property", "Industrial Property", OTHER_OPTION],
  },
  {
    type: "personalLoanTenureYears",
    label: "Personal Loan Tenure (Years)",
    values: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    type: "businessLoanTenureYears",
    label: "Business Loan Tenure (Years)",
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    type: "homeLoanTenureYears",
    label: "Home Loan Tenure (Years)",
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  },
  {
    type: "loanAgainstPropertyTenureYears",
    label: "Loan Against Property Tenure (Years)",
    values: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
];

const run = async () => {
  await connectDB();

  for (const master of MASTERS_SEED) {
    await Master.findOneAndUpdate(
      { type: master.type },
      master,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    console.log(`✓ Seeded master: ${master.type}`);
  }

  console.log("=================================");
  console.log(`✅ ${MASTERS_SEED.length} masters seeded successfully`);
  console.log("=================================");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Failed to seed masters:", error.message);
  process.exit(1);
});
