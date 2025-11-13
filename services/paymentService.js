const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/PaymentSchema");
const { default: mongoose } = require("mongoose");

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_Key_Secret,
    });
  }

  // Create a Razorpay order
  async createOrder(amount, currency = "INR") {
    const options = {
      amount: amount * 100, // Convert to paisa
      currency,
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1,
    };
    return await this.razorpay.orders.create(options);
  }



  // Verify payment signature and save payment info to DB
  async verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, amount,otherInfo) {

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_Key_Secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // const objectUserId = new mongoose.Types.ObjectId(user);
    // const objectOrderId = new mongoose.Types.ObjectId(order);

    let paymentData = {};

    if (sign === signature) {
      paymentData = {
        user: objectUserId,
        razorpayOrderId: razorpay_order_id,
        razorypayPaymentId: razorpay_payment_id,
        amountPaid: amount,
        paymentStatus: "Success",
      };
      
    } else {
      paymentData = {
        user: user,
        razorpayOrderId: razorpay_order_id,
        razorypayPaymentId: razorpay_payment_id,
        amountPaid: amount,
        paymentStatus: "Pending",
      };
    }

    await Payment.create(paymentData);

    return sign === signature;
  }
}

module.exports = new PaymentService();
