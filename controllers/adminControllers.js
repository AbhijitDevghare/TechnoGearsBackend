const { adminService } = require("../services/index");

class AdminController{
    static async login(req, res, next) {
        try {
          const {user,token,cookieOptions} = await adminService.loginAdmin(req.body.identifier, req.body.password);
  
          res.cookie("token", token, cookieOptions);
          res.status(200).json({ success: true, message: "Login Successful", user });
        } catch (err) {
          if (err.code === 11000) {
            return next(new AppError("User already Exists", 400));
          }
          next(err);
        }
      }
    
}

module.exports=AdminController