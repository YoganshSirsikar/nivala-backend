const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  channel: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isVegetarian: { type: Boolean, default: true },
  prepTime: { type: String, default: "25–35 min" },
  serves: { type: String, default: "Serves 1" },
  ingredients: { type: [String], default: [] },
  allergens: { type: [String], default: [] },
  isAvailable: { type: Boolean, default: true },
  reviewCount: { type: Number, default: 0 },
  story: { type: String, default: "" },
});

const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
