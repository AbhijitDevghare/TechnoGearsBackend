const mongoose = require("mongoose");
const User = require("./UserSchema"); // Ensure User model exists

const AdminSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" ,// Ensure this matches the User model name,
    unique: [true]

  },
  role: { 
    type: String, 
    enum: ["superadmin", "moderator"], 
    default: "moderator"
  }
}, { timestamps: true });

const Admin = mongoose.model("Admin", AdminSchema); // Explicit collection name
module.exports = Admin;
