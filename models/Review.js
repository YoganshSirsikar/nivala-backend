const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true, index: true },
    reviewer: { type: String, default: "Guest" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", maxlength: 500 },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
