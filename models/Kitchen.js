const mongoose = require("mongoose");

const kitchenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    chef: { type: String, default: "" },
    location: { type: String, default: "Local home kitchen" },
    story: { type: String, default: "" },
    specialties: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    hygieneNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kitchen", kitchenSchema);
