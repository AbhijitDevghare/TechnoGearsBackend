const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");
const AppError = require("../utils/error.utils.js");
const { userRepository } = require("../repositories/index");
const { uploadOnCloudinary } = require("../middleware/cloudinary.js");
const sendEmail = require("../utils/sendEmail.js");
const generateOtp = require("../utils/generateOtp.js");
const sendSms = require("../utils/sendSms.js");
const crypto = require("crypto");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

class UserService {
  async getUserById(findById) {
    const user = await userRepository.findById(findById);
    if (!user) throw new AppError("User not found", 400);
    user.password = undefined;
    return user;
  }

  async registerUser(data, file) {
    let { name, username, email, phoneNumber, password, confirmPassword, address, pincode, state } = data;

    phoneNumber = "+91" + phoneNumber;

    if (!name || !username || !email || !phoneNumber || !address || !pincode || !state || !password || !confirmPassword) {
      throw new AppError("All fields are required", 400);
    }

    if (!emailValidator.validate(email)) {
      throw new AppError("Invalid Email Format", 400);
    }

    // Validate email deliverability using Abstract API
    // try {
    //   const apiKey = process.env.EMAIL_VERIFICATIONKEY;
    //   const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;
    //   const { data: emailResponse } = await axios.get(url);
    //   if (!emailResponse || emailResponse.deliverability !== "DELIVERABLE") {
    //     throw new AppError("Invalid or undeliverable email", 400);
    //   }
    // } catch (error) {
    //   throw new AppError("Email verification service is temporarily unavailable", 500);
    // }


    if (await userRepository.findByEmail(email)) {
      throw new AppError("Use another email. This email is already used", 400);
    }

    if (await userRepository.findByUsername(username)) {
      throw new AppError("Username not available", 400);
    }


    if (password !== confirmPassword) {
      throw new AppError("Password and Confirm Password don't match", 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    if (!passwordRegex.test(password)) {
      throw new AppError("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character", 400);

    }

    const localFilePath = file ? file.path : "default-avatar.jpg";
    const folderName = "TechnoGears/userAvatar";
    const response = await uploadOnCloudinary(localFilePath, folderName);

    const user = await userRepository.createUser({
      name,
      username,
      email,
      phoneNumber,
      password,
      pincode,
      address,
      state,
      avatar: response ? { public_id: response.public_id, url: response.url } : {}
    });

    const token = await user.jwtToken();
    user.password = undefined;

 // Set cookie options for session
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    // CRUCIAL: Must be true for SameSite=None to work
    // secure: process.env.NODE_ENV === 'production', 
    // // CRUCIAL: Allows the cookie to be sent in cross-site requests
    // sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' 
    secure: true,
    sameSite: "none"
};
    return { user, token, cookieOptions };
  }


  async loginUser(identifier, password) {
    if (!identifier || !password) {
      throw new AppError("Identifier (username, email, or phone number) and password are required", 400);
    }

    const user =
      (await userRepository.findByEmail(identifier)) ||
      (await userRepository.findByUsername(identifier)) ||
      (await userRepository.findByPhoneNumber(identifier));

    if (!user) {
      throw new AppError("User doesn't exist", 404);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError("Invalid Credentials", 400);
    }

    const token = await user.jwtToken();
    user.password = undefined;

// Set cookie options for session
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    // CRUCIAL: Must be true for SameSite=None to work
    // secure: process.env.NODE_ENV === 'production', 
    // // CRUCIAL: Allows the cookie to be sent in cross-site requests
    // sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' 
    secure: true,
    sameSite: "none"
};

    return { user, token, cookieOptions };
  }

  async updateUserProfile(userId, data, file) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    let isUpdated = false;

    for (let key of Object.keys(data)) {
      if (data[key] !== undefined && data[key] !== user[key]) {
        user[key] = data[key];
        isUpdated = true;
      }
    }

    if (file) {
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      const response = await uploadOnCloudinary(file.path, "TechnoGears/userAvatar");
      user.avatar = { public_id: response.public_id, url: response.url };
      isUpdated = true;
    }

    if (!isUpdated) {
      return user;
    }

    await userRepository.updateUser(user);
    return user;
  }

  async forgetPassword(email, req) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/user/password/reset/${resetToken}`;
    const message = `You requested a password reset. Please make a PUT request to:\n\n${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
      html: `<b>${message}</b>`
    });
  }

  async sendOtp(phoneNumber, email) {
    const user = await userRepository.findByPhoneNumber(phoneNumber);
    if (!user) throw new AppError("User not found", 404);

    const otp = generateOtp();
    Object.assign(user, {
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000
    });

    await userRepository.updateUser(user);

    const message = `Your OTP is ${otp}. It is valid for 10 minutes.`;

    // console.log(user.phoneNumber)

    await sendSms(user.phoneNumber, message);

    const userEmail = email || user.email;
    if (userEmail) {
      try {
        await sendEmail({
          to: userEmail,
          subject: "Your OTP Code",
          text: message,
          html: `<b>${message}</b>`
        });
      } catch (error) {
        console.error("Failed to send OTP email:", error.message);
      }
    }

    return "OTP sent successfully";
  }

  async verifyOtp(phoneNumber, email, otp, password) {
    const user = await userRepository.findByPhoneNumber(phoneNumber) || await userRepository.findByEmail(email);
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;

    await userRepository.updateUser(user);
    return "OTP verified successfully";
  }
}

module.exports = new UserService();
