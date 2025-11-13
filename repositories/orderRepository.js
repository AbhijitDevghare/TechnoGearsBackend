const { Order } = require("../models");

class OrderRepository
{
    async createOrder(data)
    {
        return Order.create(data)
    }

    async findOrdersByUserId (userId)
    {
        return await Order
        .find({ user: userId })    // filter by user
        .sort({ createdAt: -1 });  // newest first
          }

    async updateOrderStatus(orderId,status)
    {
        const order = await Order.findById(orderId)
        order.shippingStatus=status;
        order.save();
        return order;
    }
}

module.exports = new OrderRepository()