'use strict';

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

/**
 * Retrieves the user's cart.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} The user's cart.
 */
const getUserCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail category',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // If the user doesn't have a cart, create a new one
    if (!cart) {
      cart = new Cart({ userId, products: [] });
      await cart.save();
    }

    return cart.formatCart();
  } catch (error) {
    throw new Error(`Error occurred while getting user's cart: ${error.message}`);
  }
};

/**
 * Adds a product to the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to add.
 * @param {number} quantity - The quantity of the product to add.
 * @returns {Promise<Object>} Confirmation message and updated cart.
 */
const addProductToCart = async (userId, productId, quantity = 1) => {
  try {
    const product = await Product.findById(productId)
      .select('title price stock discountPercentage rating thumbnail category')
      .populate('category');

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    let cart = await Cart.findOne({ userId }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    if (!cart) {
      cart = new Cart({ userId, products: [{ product, quantity }] });
    } else {
      const existingItem = cart.products.find((item) => item.product._id.equals(productId));
      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.products.push({ product, quantity });
      }
    }

    await cart.save();

    return {
      message: 'Product added to cart successfully',
      cart: cart.formatCart(),
    };
  } catch (error) {
    throw new Error(`Error occurred while adding product to cart: ${error.message}`);
  }
};

/**
 * Removes a product or clears the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to remove (optional).
 * @param {string} cartId - The ID of the cart to clear (optional).
 * @returns {Promise<Object>} Confirmation message and updated cart.
 */
const removeFromCart = async (userId, productId, cartId) => {
  try {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (productId) {
      const indexToRemove = cart.products.findIndex((item) => item.product._id.equals(productId));
      if (indexToRemove === -1) {
        throw new Error('Product not found in cart');
      }
      cart.products.splice(indexToRemove, 1);
    }

    if (cartId) {
      cart.products = [];
    }

    await cart.save();

    return {
      message: 'Product removed from cart successfully',
      cart: cart.formatCart(),
    };
  } catch (error) {
    throw new Error(`Error occurred while removing product from cart: ${error.message}`);
  }
};

module.exports = {
  getUserCart,
  addProductToCart,
  removeFromCart,
};
