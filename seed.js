const mongoose = require("mongoose");
require("dotenv").config();
const Dish = require("./models/Dish");
const dishes = require("./dishes");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Clear any existing dishes first (avoids duplicates if run multiple times)
    await Dish.deleteMany({});
    console.log("🗑️  Cleared old dishes");

    // Insert all dummy dishes into the database
    await Dish.insertMany(dishes);
    console.log(`🌱 Seeded ${dishes.length} dishes into MongoDB`);

    mongoose.connection.close();
    console.log("Connection closed. Done!");
  })
  .catch((err) => {
    console.error("❌ Error:", err);
  });