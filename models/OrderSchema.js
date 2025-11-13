const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // or whatever your product model is called
          required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String   
      }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  shippingStatus:{
    type: String,
    enum: ['Pending', 'Shipped', 'Out for Delivery','Delivered','Cancelled'],
    default: 'Pending'
  },
  shippingAddress:{
    type:Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
