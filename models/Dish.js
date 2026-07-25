const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  channel: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;