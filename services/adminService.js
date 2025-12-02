const AppError = require("../utils/error.utils.js");
const { userRepository } = require("../repositories/index");
const bcrypt = require("bcrypt");

class AdminService {
  async loginAdmin(identifier, password) {
    // Validate input
    if (!identifier || !password) {
      throw new AppError("Identifier (username, email, or phone number) and password are required", 400);
    }

    // Try to find user by email, username, or phone number
    const user =
      await userRepository.findByEmail(identifier) ||
      await userRepository.findByUsername(identifier) ||
      await userRepository.findByPhoneNumber(identifier);

    if (!user) {
      throw new AppError("User doesn't exist", 404);
    }

    // Check if password is correct
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new AppError("Invalid Credentials", 400);
    }

    // Check if user is an admin
    const admin = await userRepository.findAdmin(user._id);
    if (!admin) {
      throw new AppError("Not Authorized user");
    }

    // Attach role to user object
    Object.assign(user, { role: admin.role });

    // Generate JWT token
    const token = await user.jwtToken();

    // Don't expose password in the response
    user.password = undefined;

    // Set cookie options for session
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    // CRUCIAL: Must be true for SameSite=None to work
    secure: process.env.NODE_ENV === 'production', 
    // CRUCIAL: Allows the cookie to be sent in cross-site requests
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' 
};

    return { user, token, cookieOptions };
  }
}

module.exports = new AdminService();
