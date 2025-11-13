require("dotenv").config();
const JWT = require('jsonwebtoken');
const AppError = require('../utils/error.utils.js');


const jwtAuth = (req, res, next) => {
    const token = req.cookies?.token || null;
    if (!token) {
        return next(new AppError("Not Authorized: No token provided",401));
    }

    try {
        // Verify JWT token
        const payload = JWT.verify(token, process.env.SECRET);

        // Attach user info to the request object
        req.user = { id: payload.id, email: payload.email };
        next();
    } catch (error) {
        return next(new AppError(`Not Authorized : ${error.message}`,401))
    }
};

module.exports = jwtAuth;
