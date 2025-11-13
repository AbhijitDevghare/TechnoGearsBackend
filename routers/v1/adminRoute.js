const express = require("express")
const {adminController} = require("../../controllers/index")
const router = express.Router()

router.post("/auth/login",adminController.login)

module.exports = router;
