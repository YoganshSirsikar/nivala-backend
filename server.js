const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Dish = require("./models/Dish");
const Order = require("./models/Order");
const Kitchen = require("./models/Kitchen");
const DishRequest = require("./models/Request");
const Review = require("./models/Review");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Nivala backend is running!");
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

// Seller: add a dish
app.post("/api/dishes", async (req, res) => {
  try {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  } catch (err) {
    res.status(400).json({ message: "Error creating dish", error: err.message });
  }
});

// Seller: update dish (price, availability, prep time, etc.)
app.patch("/api/dishes/:id", async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (err) {
    res.status(400).json({ message: "Error updating dish" });
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

// Kitchens: list + upsert profile (seller onboarding demo)
app.get("/api/kitchens", async (req, res) => {
  try {
    const kitchens = await Kitchen.find().sort({ createdAt: -1 });
    res.json(kitchens);
  } catch (err) {
    res.status(500).json({ message: "Error fetching kitchens" });
  }
});

app.post("/api/kitchens", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Kitchen name required" });
    const kitchen = await Kitchen.findOneAndUpdate({ name }, req.body, {
      new: true,
      upsert: true,
    });
    res.status(201).json(kitchen);
  } catch (err) {
    res.status(400).json({ message: "Error saving kitchen", error: err.message });
  }
});

// Orders: create
app.post("/api/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: "Error creating order", error: err.message });
  }
});

// Orders: list by buyer or kitchen
app.get("/api/orders", async (req, res) => {
  try {
    const filter = {};
    if (req.query.buyer) filter.buyer = req.query.buyer;
    if (req.query.kitchen) filter.kitchen = req.query.kitchen;
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Orders: update status (seller: accept -> preparing -> ready -> completed)
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Placed", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Error updating order" });
  }
});

// Dish requests: buyer requests what they crave
app.post("/api/requests", async (req, res) => {
  try {
    const r = await DishRequest.create(req.body);
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ message: "Error creating request", error: err.message });
  }
});

app.get("/api/requests", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.locality) filter.locality = req.query.locality;
    const list = await DishRequest.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

app.patch("/api/requests/:id/accept", async (req, res) => {
  try {
    const { kitchen } = req.body;
    const r = await DishRequest.findByIdAndUpdate(
      req.params.id,
      { status: "accepted", acceptedBy: kitchen || "" },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Request not found" });
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: "Error accepting request" });
  }
});

// Demand map: aggregate open requests by dish + locality
app.get("/api/demand", async (req, res) => {
  try {
    const agg = await DishRequest.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: { dish: "$dishName", locality: "$locality" }, count: { $sum: 1 }, avgOffer: { $avg: "$priceOffer" } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    res.json(agg.map((a) => ({ dish: a._id.dish, locality: a._id.locality, count: a.count, avgOffer: Math.round(a.avgOffer || 0) })));
  } catch (err) {
    res.status(500).json({ message: "Error computing demand" });
  }
});

// Reviews: real shared reviews in Atlas
app.post("/api/reviews", async (req, res) => {
  try {
    const { dishId, reviewer, rating, comment } = req.body;
    if (!dishId || !rating) return res.status(400).json({ message: "dishId and rating required" });
    const r = await Review.create({ dishId, reviewer: reviewer || "Guest", rating, comment: comment || "" });
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ message: "Error saving review", error: err.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const filter = {};
    if (req.query.dishId) filter.dishId = req.query.dishId;
    const list = await Review.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
