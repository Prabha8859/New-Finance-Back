const mongoose = require("mongoose");

const {
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  MAX_NAME_LENGTH,
} = require("../location.constants");

/*
==========================================
State — belongs to exactly one Country.
==========================================
*/

const stateSchema = new mongoose.Schema(
  {
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country is required"],
    },

    name: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
      maxlength: [MAX_NAME_LENGTH, `State name is too long (max ${MAX_NAME_LENGTH} characters)`],
    },

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

stateSchema.index({ countryId: 1, slug: 1 }, { unique: true });
stateSchema.index({ countryId: 1, status: 1, name: 1 });
/* slug-first so name searches anywhere in the hierarchy use an index. */
stateSchema.index({ slug: 1 });

module.exports = mongoose.model("State", stateSchema);
