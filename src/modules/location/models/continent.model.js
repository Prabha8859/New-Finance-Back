const mongoose = require("mongoose");

const {
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  MAX_NAME_LENGTH,
} = require("../location.constants");

/*
==========================================
Continent — root of the location hierarchy.

Continent -> Country -> State -> City -> Pincode
==========================================
*/

const continentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Continent name is required"],
      trim: true,
      maxlength: [MAX_NAME_LENGTH, `Continent name is too long (max ${MAX_NAME_LENGTH} characters)`],
    },

    /* Lowercased, punctuation-free copy of name — every duplicate/lookup
       check goes through this so "Asia" and "asia " cannot both exist. */
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

continentSchema.index({ slug: 1 }, { unique: true });
continentSchema.index({ status: 1, name: 1 });

module.exports = mongoose.model("Continent", continentSchema);
