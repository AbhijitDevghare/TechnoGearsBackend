const express = require("express");
const router = express.Router();

// Import individual route modules
const userRoutes = require("./userRoute.js");
const adminRoutes = require("./adminRoute.js")
const productRoutes = require("./productRoutes.js")
const cartRoutes = require("./cartRoute.js")
const paymentRoutes = require("./paymenRoute.js")
const orderRoutes = require("./orderRoutes.js")

// User Routes 
router.use("/user", userRoutes);
router.use("/admin",adminRoutes);
router.use("/product",productRoutes)
router.use("/cart",cartRoutes)
router.use("/payment",paymentRoutes)
router.use("/orders",orderRoutes)

module.exports = router;
