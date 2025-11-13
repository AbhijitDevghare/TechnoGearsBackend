require("dotenv").config();
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require('bcrypt'); 

const UserSchema = new mongoose.Schema({
  avatar: {
    public_id: { type: String },
    url: { type: String, trim: true }
  },
  name: {
    type: String,
    required: [true, "Name required"],
    trim: true,
    maxLength: [50, "Name should not exceed 30 characters"],
    minLength: [5, "Name must be greater than 5 characters"]
  },
  username: {
    type: String,
    required: [true, "Username required"],
    unique: true,
    maxLength: [20, "Username should not exceed 20 characters"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[1-9]\d{7,14}$/, "Invalid phone number format"], // Ensures valid phone format
    maxLength: 15
  }
  ,
  address:{
    type:String,
    required:true
  },
  pincode:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minLength: [5, "The password must be greater than 5 characters"],
    select: false
  },
  role: {
    type: String,
    default:"user"
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: String,
  otpExpires: Date
}, {
  timestamps: true
});



// Middleware to hash the password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

UserSchema.methods = {
  jwtToken() {
    return JWT.sign(
      { id: this._id, email: this.email },
      process.env.SECRET,
      { expiresIn: '168h' }
    );
  }
};

module.exports = mongoose.model("User", UserSchema);
