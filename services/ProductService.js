const { uploadOnCloudinary } = require("../middleware/cloudinary");
const { Product } = require("../models");
const { productRepository, CategoryRepository } = require("../repositories/index");
const path = require("path");

class ProductService {
  async createProduct(productData, files) {
    if (!productData.name || !productData.price || !productData.category || !productData.brand) {
      throw new Error("Product name, price, category, and brand name are required.");
    }

    let uploadedImages = [];

    // Upload all provided product images
    if (files && files.length > 0) {
      const folderName = "TechnoGears/products";

      uploadedImages = await Promise.all(
        files.map(async (file) => {
          const response = await uploadOnCloudinary(file.path, folderName);
          return response ? { public_id: response.public_id, url: response.url } : null;
        })
      );

      uploadedImages = uploadedImages.filter(image => image !== null); // Filter failed uploads
    }

    // Use uploaded images or fallback to default image
    productData.images = uploadedImages.length > 0
      ? uploadedImages
      : [{ public_id: "default", url: "https://res.cloudinary.com/dmu6jqv5a/image/upload/v1743389203/default_product_phnaid.png" }];

    const product = await productRepository.createProduct(productData);

    // Create the category if it doesn't exist
    const isCategoryExist = await CategoryRepository.findCategory(product.category);
    if (!isCategoryExist) {
      await CategoryRepository.createCategory({ name: product.category });
    }

    return product;
  }

  async getProducts(filter, pageNumber) {
    const options = {
      page: pageNumber,
      limit: 50,
      sortBy: "createdAt",
      order: "desc"
    };

    return await productRepository.getProducts(filter, options);
  }

  
  async getLowStockProducts()
  {
    
    return await productRepository.getLowStockProducts()
  }


  async searchProducts(query, options = {}) {
    const regexQuery = { $regex: query, $options: "i" };

    const filter = {
      $or: [
        { name: regexQuery },
        { description: regexQuery },
        { category: regexQuery },
        { brand: regexQuery }
      ]
    };

    return await productRepository.getProducts(filter, options);
  }

  async updateProductStock(productId,quantity)
  {
    const productUpdated = await productRepository.updateStock(productId,quantity)
    return productUpdated
  }
   async updateProductDetails(productData, files, productId) {

      if (!productId) {
      throw new Error("Product ID is required.");
    }

    // Find the existing product
    
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw new Error("Product not found.");
    }

    // Upload new images if any
    let uploadedImages = [];

    if (files && files.length > 0) {
      const folderName = "TechnoGears/products";

      uploadedImages = await Promise.all(
        files.map(async (file) => {
          const response = await uploadOnCloudinary(file.path, folderName);
          return response ? { public_id: response.public_id, url: response.url } : null;
        })
      );

      uploadedImages = uploadedImages.filter(image => image !== null);
    }

    // Merge old images with new ones
    const updatedImages = [...existingProduct.images, ...uploadedImages];

    // Update product fields (only update those provided in productData)
    Object.keys(productData).forEach((key) => {
      existingProduct[key] = productData[key];
    });

    // Update image array
    existingProduct.images = updatedImages;

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    return updatedProduct;
  }

  async deletedProductById(productId)
  {
    return await Product.findByIdAndDelete(productId)
  }
}

module.exports = new ProductService();
