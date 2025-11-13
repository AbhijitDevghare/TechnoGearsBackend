const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      index: true,
      unique:true
    }, 
    description: { 
      type: String, 
      required: true 
    }, 
    category: {
        type: String, 
        required: true 
    },
    brand: 
    { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    }, 
    discount: {
      percentage: {
         type: Number,
          default: 0
         }, 
      validTill: { 
        type: Date 
      } 
    },
    stock: {
      available: {
         type: Number, 
         required: true,
          default: 0 
        }, 
      reserved: {
         type: Number, 
         default: 0 
        } 
    },
    ratings: {
      average: { 
        type: Number, 
        default: 0 
      }, 
      reviewsCount: { 
        type: Number, 
        default: 0 
      },
      reviews: [
        {
          user: { type: String }, 
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String }
        }
      ]
    },
    images: [
      {
        public_id:{
        type:String,
        required:true,
        default:""
      },
      url:{
        type:String,
        required:true,
        trim:true
      }
    }
    ], 
    shipping: {
      deliveryOptions: {
        type: [String], // Array of strings
        enum: ["Standard", "Express", "Same-day", "Overnight"], // Allowed values
        required: true
      }      
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;


