const mongoose = require("mongoose");

const masterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Master type is required"],
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, "Master label is required"],
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Master", masterSchema);
