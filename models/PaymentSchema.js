const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // razorpay_order_id: {
    provider_order_id: {
    type: String,
    required: true
  },
  // razorpay_payment_id: {
  transaction_id:{
    type: String,
    required: true,
    unique:true
  },
  // razorpay_signature: {
    payment_signature:{
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // make sure you have a User model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
