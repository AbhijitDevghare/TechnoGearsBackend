const express = require("express");
const { createRazorpayOrder, verifyAndSavePayment } = require("../../controllers/paymentController");
const router = express.Router();


router.post("/place-order", createRazorpayOrder);
router.post("/verify", verifyAndSavePayment);

module.exports = router;
