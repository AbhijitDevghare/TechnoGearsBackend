const Cart = require("../models/CartSchema");

class CartRepository {
  async createCart(cartData) {
    return await Cart.create(cartData);
  }

  async getCartByUserId(userId) {
    const cart = await Cart.findOne({ user:userId }).populate('items.product');

    return cart
  }

  async addItemToCart(userId, product, quantity,totalPrice) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $push: { items: { product, quantity ,totalPrice} } },
      { new: true, upsert: true }
    );
  }

  async updateItemQuantity(userId, productId, quantity,totalPrice) {
    return await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity,"items.$.totalPrice":totalPrice } },
      { new: true }
    );
  }

  async removeItemFromCart(userId, productId) {
    // let res =  await Cart.findOneAndUpdate(
    //   { user: userId },
    //   { $pull: { items: { product: productId } } },
    //   { new: true }
    // );

    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true } // returns updated cart after item is removed
    );

    console.log("res")
    console.log(updatedCart)

    return updatedCart
  }

  async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalPrice: 0 } },
      { new: true }
    );
  }
}

module.exports = new CartRepository();
