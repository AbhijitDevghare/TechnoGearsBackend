const {productService} = require("../services/index");

class ProductController {
  static async createProduct(req, res,next) {    
    try {
      const product = await productService.createProduct(req.body, req.files); // Change req.file to req.files
      res.status(201).json({
        message:"Succesfully created the product",
        product});
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      let { pageNumber, filter } = req.query;  
  
      // Ensure pageNumber is a valid number
      pageNumber = parseInt(pageNumber) || 1;
  
      // Ensure filter is a valid object
      try {
        filter = filter ? JSON.parse(filter) : {};
      } catch (error) {
        return res.status(400).json({ error: "Invalid filter format" });
      }
  
      const products = await productService.getProducts(filter, pageNumber);
      res.status(200).json(products); // Changed status to 200 (OK)
    } catch (err) {
      next(err);
    }
  }


  // Controller to handle searching functionality 

 static async searchProducts(req, res,next) {
    try {
      console.log("SEARCH PRODUCTS")
      const query = req.query.q || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder || "desc";

      console.log(req.query)
      const result = await productService.searchProducts(query, {
        page,
        limit,
        sortBy,
        sortOrder
      });

      return res.status(200).json( result);
    } catch (error) {
      next(err);
    }
  }

  static async deleteProductById(req,res,next){
    try {
        const deletedProduct = await productService.deletedProductById(req.params.productId)
        res.status(200).json({
          "message":"Product deleted Successfully"
        })
    } catch (error) {
      next(err);
    }
  }

  static async getLowStockProducts(req,res,next)
  {
    try {
      const products = await productService.getLowStockProducts();
      res.status(200).json({
        products
      })
    } catch (error) {
      next(err);
    }
  }

  static async updateProductStock(req,res,next)
  {
    try {
      const productId = req.params.productId;
      const {quantity} = req.body
      
        console.log(productId,quantity)
      
      await productService.updateProductStock(productId,quantity)
      res.status(200).json({
      message:"Product updated successfully..."
      })
    } catch (error) {
      next(error)
    }
  }

  static async updateProductDetails(req,res,next){

    try {
      const updatedProduct = await productService.updateProductDetails(req.body,req.files,req.params.productId)
      console.log(updatedProduct)
      res.status(200).json({
        "message":"Product Updated Successfully"
      })
    } catch (error) {
      next(error)
    }
  }
  
}

module.exports = ProductController;
