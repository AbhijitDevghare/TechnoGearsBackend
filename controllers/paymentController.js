const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/OrderSchema'); // Your order schema
const Payment = require('../models/PaymentSchema'); // Your payment schema
const mongoose = require('mongoose');
// const { CartRepository } = require('../repositories');
const repositories = require('../repositories');
const CartRepository = repositories.CartRepository || repositories;
const AppError = require('../utils/error.utils'); // Make sure this path is correct and exports AppError
const sendEmail = require('../utils/sendEmail');
const User = require('../models/UserSchema');
const sendSms = require('../utils/sendSms');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = async (req, res, next) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // in paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    return next(new AppError(`Error: ${error.message}`, error.code || 500));
  }
};

exports.verifyAndSavePayment = async (req, res, next) => {
  const {
    provider_order_id,
    transaction_id,
    payment_signature,
    cartItems,
    userId,
    totalAmount,
    shippingAddress
  } = req.body;

  const body = provider_order_id + "|" + transaction_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const objectUserId = new mongoose.Types.ObjectId(userId);

  if (expectedSignature === payment_signature) {
    try {
      const payment = await Payment.create({
        provider_order_id,
        transaction_id,
        payment_signature,
        amount: totalAmount,
        user: objectUserId
      });

      const order = await Order.create({
        user: objectUserId,
        items: cartItems,
        totalAmount,
        paymentId: payment._id,
        status: 'Paid',
        shippingAddress: shippingAddress,
        shippingStatus: "Pending"
      });

      const user = await User.findById(objectUserId).select('email').select('phoneNumber');

      const amountInRupees = totalAmount / 100;

      const textMessage = `Order ${order._id} confirmed! ₹${amountInRupees.toFixed(2)} for ${cartItems.length} items. Shipping to ${shippingAddress.city}-${shippingAddress.pincode}. Thanks!`;

        const htmlMessage = `
          <p>Hi there,</p>
          <p>Thank you for your purchase! 🎉</p>
          <p>We have received your payment successfully. Your order has been confirmed and is now being processed.</p>
          <h3>📦 Order Details:</h3>
          <ul>
            <li><strong>Order ID:</strong> ${order._id}</li>
            <li><strong>Total Amount:</strong> ₹${amountInRupees.toFixed(2)}</li>
            <li><strong>Items:</strong> ${cartItems.length}</li>
            <li><strong>Shipping Address:</strong> 
              ${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.pincode}
            </li>
          </ul>
          <p>You’ll receive another email once your order has been shipped.</p>
          <p>Thank you for shopping with us!<br/><strong>Best Regards,TechnoGears</strong></p>
        `;



      if (order) {
        // Send confirmation email to user
        await sendEmail({
          to: user.email,
          subject: "Order Confirmation",
          text: htmlMessage
        });

        console.log(user)

        await sendSms(user.phoneNumber, textMessage);
        await CartRepository.clearCart(objectUserId);

  
      }

      res.status(200).json({ success: true, message: "Payment verified and order placed successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Something went wrong while saving payment and order." });
    }
  } else {
    return res.status(400).json({ success: false, message: "Payment verification failed." });
  }
};