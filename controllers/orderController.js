const orderService = require('../services/orderService.js');
const AppError = require('../utils/error.utils.js');



const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    return next(new AppError(`Error: ${error.message}`, error.code));
  }
};


const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(new AppError(`Error: ${error.message}`, error.code));
  }
};


const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    return next(new AppError(`Error: ${error.message}`, error.code));
  }
};


module.exports = {
  getOrderById,
  getUserOrders,
  cancelOrder
};
