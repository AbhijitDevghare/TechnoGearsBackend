const {CartContoller} = require("../../controllers/index");
const jwtAuth = require("../../middleware/jwtAuth");

const express = require("express")
const router = express.Router()

router.post("/add",jwtAuth,CartContoller.addToCart)
router.get("/",jwtAuth,CartContoller.getUserCart)
router.put("/remove/:productId",jwtAuth,CartContoller.removeItemFromCart)

module.exports = router;
