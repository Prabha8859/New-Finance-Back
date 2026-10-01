const mongoose = require("mongoose");

const {
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  MAX_PREFIX_LENGTH,
  PINCODE_REGEX,
} = require("../location.constants");

/*
==========================================
Pincode — belongs to a City, and (denormalized) its State + Country.

stateId/countryId sit alongside cityId so the admin can list/filter a state's
or a country's pincodes without a join, and so a pincode can never silently
drift away from its city's state — the service keeps all three in sync on
every write.

pincode is a STRING: leading zeros must survive, and it is never math.

Uniqueness: one pincode value PER COUNTRY. The same digits can legitimately
exist in two countries, but inside India every pincode appears exactly once —
which also makes public lookup deterministic.
==========================================
*/

const pincodeSchema = new mongoose.Schema(
  {
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country is required"],
    },

    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
    },

    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
      match: [PINCODE_REGEX, "Pincode must be 3 to 10 digits"],
    },

    /* Optional routing prefix (e.g. first 3 digits / postal circle code). */
    prefix: {
      type: String,
      trim: true,
      default: "",
      maxlength: [MAX_PREFIX_LENGTH, `Prefix is too long (max ${MAX_PREFIX_LENGTH} characters)`],
    },

    status: {
      type: String,
      enum: {
        values: LOCATION_STATUS_VALUES,
        message: "Status must be one of: active, inactive, coming_soon",
      },
      default: LOCATION_STATUS_DEFAULT,
    },
  },
  {
    timestamps: true,
  }
);

/* Unique per country; pincode-first order also serves the public "find this
   pincode" lookups, so no separate { pincode: 1 } index is needed. */
pincodeSchema.index({ pincode: 1, countryId: 1 }, { unique: true });
pincodeSchema.index({ stateId: 1, cityId: 1, status: 1 });
/* City-scoped admin lists and cascade child scans. */
pincodeSchema.index({ cityId: 1, status: 1 });

module.exports = mongoose.model("Pincode", pincodeSchema, "location.pincodes");
