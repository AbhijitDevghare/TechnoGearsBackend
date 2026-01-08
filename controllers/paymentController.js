const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/OrderSchema");
const Payment = require("../models/PaymentSchema");
const User = require("../models/UserSchema");

const repositories = require("../repositories");
const CartRepository = repositories.CartRepository || repositories;

const AppError = require("../utils/error.utils");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   CREATE RAZORPAY ORDER
========================= */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return next(new AppError("Amount is required", 400));
    }

    // amount comes in RUPEES → convert to PAISE (INTEGER)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (!Number.isInteger(amountInPaise)) {
      return next(new AppError("Amount must be an integer in paise", 400));
    }

    const options = {
      amount: amountInPaise, // ✅ INTEGER ONLY
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    console.log("RAZORPAY ORDER OPTIONS:", options);

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return next(new AppError(error.message || "Razorpay order failed", 500));
  }
};

/* =========================
   VERIFY PAYMENT & SAVE
========================= */
exports.verifyAndSavePayment = async (req, res, next) => {
  try {
    const {
      provider_order_id,
      transaction_id,
      payment_signature,
      cartItems,
      userId,
      totalAmount, // IN PAISE
      shippingAddress,
    } = req.body;

    const body = `${provider_order_id}|${transaction_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== payment_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const payment = await Payment.create({
      provider_order_id,
      transaction_id,
      payment_signature,
      amount: Number(totalAmount), // ✅ STORE IN PAISE
      user: objectUserId,
    });

    const order = await Order.create({
      user: objectUserId,
      items: cartItems,
      totalAmount: Number(totalAmount), // PAISE
      paymentId: payment._id,
      status: "Paid",
      shippingAddress,
      shippingStatus: "Pending",
    });

    const user = await User.findById(objectUserId).select("email phoneNumber");

    const amountInRupees = (Number(totalAmount) / 100).toFixed(2);

    const smsText = `Order ${order._id} confirmed! ₹${amountInRupees} for ${cartItems.length} items. Shipping to ${shippingAddress.city}-${shippingAddress.pincode}.`;

    const emailHtml = `
      <p>Hi,</p>
      <p>Your payment was successful 🎉</p>
      <h3>Order Details</h3>
      <ul>
        <li><b>Order ID:</b> ${order._id}</li>
        <li><b>Total:</b> ₹${amountInRupees}</li>
        <li><b>Items:</b> ${cartItems.length}</li>
        <li><b>Address:</b> ${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.pincode}</li>
      </ul>
      <p>Thanks for shopping with us.</p>
    `;

    // await sendEmail({
    //   to: user.email,
    //   subject: "Order Confirmation",
    //   text: emailHtml,
    // });

    // await sendSms(user.phoneNumber, smsText);

    await CartRepository.clearCart(objectUserId);

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Order processing failed" });
  }
};
