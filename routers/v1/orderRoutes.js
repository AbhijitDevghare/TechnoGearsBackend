const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById, getUserOrders, cancelOrder } = require('../../controllers/orderController');
const isAdminCheck = require('../../middleware/isAdminCheck');
const jwtAuth = require('../../middleware/jwtAuth');

router.get('/user',jwtAuth,getUserOrders);
router.get('/:id', jwtAuth, getOrderById,);//
router.delete('/cancel/:id', jwtAuth, cancelOrder);

module.exports = router;
