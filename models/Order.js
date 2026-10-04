const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: String },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    channel: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: String, default: "Guest" },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    mode: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    address: { type: String, default: "" },
    payment: { type: String, default: "upi (demo)" },
    status: {
      type: String,
      enum: ["Placed", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Placed",
    },
    etaMinutes: { type: Number, default: 40 },
    kitchen: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
