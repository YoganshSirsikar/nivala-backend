const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Dish = require("./models/Dish");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("GharKaKhana backend is running!");
});

// Get all dishes
app.get("/api/dishes", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dishes" });
  }
});

// Get a single dish by MongoDB _id
app.get("/api/dishes/:id", async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dish" });
  }
});

// Get all dishes for a specific channel
app.get("/api/channels/:channelName", async (req, res) => {
  try {
    const decodedName = decodeURIComponent(req.params.channelName);
    const channelDishes = await Dish.find({ channel: decodedName });
    res.json(channelDishes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching channel dishes" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});