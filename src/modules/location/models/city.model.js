const mongoose = require("mongoose");

const {
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  MAX_NAME_LENGTH,
} = require("../location.constants");

/*
==========================================
City — belongs to exactly one State.
==========================================
*/

const citySchema = new mongoose.Schema(
  {
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
    },

    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
      maxlength: [MAX_NAME_LENGTH, `City name is too long (max ${MAX_NAME_LENGTH} characters)`],
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

citySchema.index({ stateId: 1, slug: 1 }, { unique: true });
citySchema.index({ stateId: 1, status: 1, name: 1 });
/* slug-first so name searches anywhere in the hierarchy use an index. */
citySchema.index({ slug: 1 });

module.exports = mongoose.model("City", citySchema, "location.cities");
