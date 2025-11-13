const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      totalPrice:Number
    }],
    total: Number
  }, { timestamps: true });
  
  const Cart = mongoose.model("Cart", CartSchema);
  module.exports = Cart;
  