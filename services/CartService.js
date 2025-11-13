const { Product } = require("../models");
const { CartRepository, productRepository } = require("../repositories/index");
const mongoose = require("mongoose");
const AppError = require("../utils/error.utils");

// Utility to calculate total price after applying discount and quantity
const calculatePriceWithDiscounts = (price, discount, quantity) => {
  price = price - ((price * discount) / 100);
  return quantity * price;
};

class CartService {
  // Get the current user's cart
  async getUserCart(userId) {
    const cart = await CartRepository.getCartByUserId(userId);

    // If the cart doesn't exist or has no items, return an empty items array
    if (!cart || !cart.items || cart.items.length === 0) {
      return { ...cart.toObject(), items: [] };
    }

    return cart.toObject();
  }

  // Add an item to the user's cart
  async addToCart(userId, productId, quantity) {
    // Check if the product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new AppError("Product not found. Unable to add the product into the cart.");
    }

    // Check if enough stock is available
    if (product?.stock?.available < quantity) {
      throw new AppError("Not enough stock available to fulfill the request.");
    }

    const cart = await CartRepository.getCartByUserId(userId);
    const discountPercent = product.discount?.percentage > 0 ? product.discount.percentage : 0;

    let addedItem;

    if (cart) {
      // Check if product is already in the cart
      const existingItem = cart.items.find(
        item => item.product._id.toString() === product._id.toString()
      );

      if (existingItem) {
        // If already exists, update quantity and total price
        const updatedQuantity = existingItem.quantity + quantity;
        const totalPrice = calculatePriceWithDiscounts(product.price, discountPercent, updatedQuantity);

        await CartRepository.updateItemQuantity(userId, productId, updatedQuantity, totalPrice);

        addedItem = {
          product,
          quantity: updatedQuantity,
          totalPrice
        };
      } else {
        // If not in cart, add as a new item
        const totalPrice = calculatePriceWithDiscounts(product.price, discountPercent, quantity);

        await CartRepository.addItemToCart(userId, productId, quantity, totalPrice);

        addedItem = {
          product,
          quantity,
          totalPrice
        };
      }
    } else {
      // If cart doesn't exist, create a new one
      const totalPrice = calculatePriceWithDiscounts(product.price, discountPercent, quantity);

      await CartRepository.createCart({
        user: userId,
        items: [{
          product: productId,
          quantity,
          totalPrice
        }],
        totalPrice: 0
      });

      addedItem = {
        product,
        quantity,
        totalPrice
      };
    }

    // Update product stock
    product.stock.available -= quantity;
    product.stock.reserved += quantity;
    await product.save();

    return addedItem;
  }

  // Update quantity of a specific item in the cart
  async updateCartItem(userId, productId, quantity) {
    return await CartRepository.updateItemQuantity(userId, productId, quantity);
  }

  // Remove a specific product from the cart
  async removeFromCart(userId, productId) {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectProductId = new mongoose.Types.ObjectId(productId);

    return await CartRepository.removeItemFromCart(objectUserId, objectProductId);
  }

  // Completely clear the user's cart
  async clearUserCart(userId) {
    return await CartRepository.clearCart(userId);
  }
}

module.exports = new CartService();
