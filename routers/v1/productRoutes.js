const express = require("express");
const router = express.Router();
const {ProductController} = require("../../controllers/index");
const jwtAuth = require("../../middleware/jwtAuth");
const isAdminCheck = require("../../middleware/isAdminCheck");
const upload = require("../../middleware/multer");

router.post("/add", jwtAuth,isAdminCheck,upload.array("images",5),ProductController.createProduct);
router.get("/",ProductController.getProducts)
router.get("/search", ProductController.searchProducts);
router.get("/low-stock",ProductController.getLowStockProducts)
router.put("/update/:productId",ProductController.updateProductStock)

router.post("/updateProduct/:productId",upload.array("images",5),ProductController.updateProductDetails)
router.delete("/delete/:productId",ProductController.deleteProductById)

module.exports = router;
