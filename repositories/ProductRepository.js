const Category = require("../models/CategorySchema");
const {Product} = require("../models/index");

class ProductRepository {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    return await Product.create(productData);
  }

  
  /**
   * Get a product by ID
   */
  async getProductById(productId) {
    return await Product.findById(productId);
  }

  /**
   * Get all products with optional filters
   */
  async getProducts(filter, options) {
    const { page, limit, sortBy, order } = options;
  
    return await Product.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit) .lean();   
  
  }


  async getLowStockProducts()
  {
    const lowStockProducts = await Product.find({
      "stock.available": { $lt: 20 }
    });
    return lowStockProducts;
  }

  /**
   * Search products by name, description, category, or brand
   */
  async searchProducts(query, options = {}) {
    const regexQuery = { $regex: query, $options: "i" };
    return await this.getProducts(
      { $or: [{ name: regexQuery }, { description: regexQuery }, { category: regexQuery }, { brand: regexQuery }] },
      options
    );
  }

  /**
   * Update a product by ID
   */
  async updateProduct(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
  }

  /**
   * Delete a product by ID
   */
  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  /**
   * Update stock levels
   */
  async updateStock(productId, available, reserved) {
    const updateData = {};
  
    if (available !== undefined) {
      updateData["stock.available"] = available;
    }
  
    if (reserved !== undefined) {
      updateData["stock.reserved"] = reserved;
    }
  
    return await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true }
    );
  }
  
  /**
   * Reserve stock
   */
  async reserveStock(productId, quantity) {
    const product = await this.getProductById(productId);
    if (!product || product.stock.available < quantity) return null;
    product.stock.available -= quantity;
    product.stock.reserved += quantity;
    return await product.save();
  }

  /**
   * Release reserved stock
   */
  async releaseStock(productId, quantity) {
    const product = await this.getProductById(productId);
    if (!product || product.stock.reserved < quantity) return null;
    product.stock.available += quantity;
    product.stock.reserved -= quantity;
    return await product.save();
  }

  /**
   * Apply a discount
   */
  async applyDiscount(productId, percentage, validTill) {
    return await Product.findByIdAndUpdate(
      productId,
      { "discount.percentage": percentage, "discount.validTill": validTill },
      { new: true }
    );
  }

  /**
   * Remove discount
   */
  async removeDiscount(productId) {
    return await Product.findByIdAndUpdate(
      productId,
      { "discount.percentage": 0, "discount.validTill": null },
      { new: true }
    );
  }

  /**
   * Add a review
   */
  async addReview(productId, userId, rating, comment) {
    return await Product.findByIdAndUpdate(
      productId,
      { $push: { "ratings.reviews": { user: userId, rating, comment } } },
      { new: true }
    );
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId) {
    const product = await this.getProductById(productId);
    return product ? product.ratings.reviews : [];
  }

  /**
   * Calculate and update average rating
   */
  async calculateAverageRating(productId) {
    const product = await this.getProductById(productId);
    if (!product || !product.ratings.reviews.length) return null;

    const total = product.ratings.reviews.reduce((acc, review) => acc + review.rating, 0);
    product.ratings.average = total / product.ratings.reviews.length;
    product.ratings.reviewsCount = product.ratings.reviews.length;
    return await product.save();
  }

  /**
   * Update shipping details
   */
  async updateShippingDetails(productId, shippingData) {
    return await Product.findByIdAndUpdate(productId, { shipping: shippingData }, { new: true });
  }


  async increaseStock(productId,quantity)
  {
    const product = await Product.findById(productId)
    product.stock.available=product.stock.available+quantity;
    product.stock.reserved=product.stock.reserved-quantity;
    product.save();
    return product;
  }


}

module.exports = new ProductRepository();
