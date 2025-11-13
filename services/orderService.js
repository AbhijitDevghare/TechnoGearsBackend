const orderRepo = require('../repositories/orderRepository.js');
const cartRepo = require('../repositories/CartRepository.js');
const mongoose = require("mongoose");
const { CartRepository, productRepository } = require("../repositories/index");
const { Order } = require('../models/index.js');


// Fetch specific order by ID
const getOrderById = async (orderId) => {
  return await orderRepo.findOrderById(orderId);
};

// Fetch all orders made by a user
const getUserOrders = async (userId) => {
  console.log(userId)
  const objectUserId = new mongoose.Types.ObjectId(userId);

  return await orderRepo.findOrdersByUserId(objectUserId);
};



// Cancel a specific order
const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error("Order not found");
  }

  const canceledOrder = await orderRepo.updateOrderStatus(orderId, 'Cancelled');
  
  if (canceledOrder) {
    // Loop through order items and update stock
    for (const item of order.items) {
      await productRepository.increaseStock(item.productId, item.quantity); 
    }

    console.log("Order cancelled and stock updated.");
  }
};


module.exports = {
  getOrderById,
  getUserOrders,
  cancelOrder
};
