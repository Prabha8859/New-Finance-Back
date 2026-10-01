const mongoose = require("mongoose");

const {
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  MAX_NAME_LENGTH,
} = require("../location.constants");

/*
==========================================
Country — belongs to exactly one Continent.
==========================================
*/

const countrySchema = new mongoose.Schema(
  {
    continentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Continent",
      required: [true, "Continent is required"],
    },

    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
      maxlength: [MAX_NAME_LENGTH, `Country name is too long (max ${MAX_NAME_LENGTH} characters)`],
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /*
    ISO 3166-1 alpha-2 ("IN", "AE", ...). Optional because records can be
    created from the admin panel without it — but the importer always sets it.
    */
    isoCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
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

/* One country name per continent (case-insensitive via slug). */
countrySchema.index({ continentId: 1, slug: 1 }, { unique: true });
countrySchema.index({ continentId: 1, status: 1, name: 1 });
/* slug-first so name searches anywhere in the hierarchy use an index. */
countrySchema.index({ slug: 1 });

module.exports = mongoose.model("Country", countrySchema, "location.countries");
