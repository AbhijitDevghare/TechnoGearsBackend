const {User} = require("../models/index");
const {Admin} = require("../models/index");
const mongoose = require("mongoose")

class UserRepository {
  
  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findAdmin(userId)
  {
    console.log(userId)
    const admin = await Admin.findOne({ user: new mongoose.Types.ObjectId(userId) });
    return admin;
  }


  async findSeller(userID)
  {
    const seller = await SellerService.findOne({
      user: new mongoose.Types.ObjectId(userID)
    })
  }

  async findByUsername(username) {
    return await User.findOne({ username }).select('+password');
  }

  async findByPhoneNumber(phoneNumber) {
    return await User.findOne({ phoneNumber }).select('+password');
  }

  async findById(userId) {
    return await User.findById(userId);
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(user) {
    return await user.save();
  }

  async deleteUserById(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = new UserRepository();
