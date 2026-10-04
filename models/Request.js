const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    dishName: { type: String, required: true },
    category: { type: String, default: "Popular Today" },
    locality: { type: String, default: "College area" },
    priceOffer: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    requester: { type: String, default: "Guest" },
    status: { type: String, enum: ["open", "accepted", "fulfilled"], default: "open" },
    acceptedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DishRequest", requestSchema);
