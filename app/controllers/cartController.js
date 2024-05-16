'use strict';

/**
 * Module dependencies.
 */
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

/**
 * Controller function to get user's cart.
 * @returns JSON response containing user's cart.
 */
const getCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;

    // Find the user's cart and populate product details
    let cart = await Cart.findOne({ userId: currentUserID }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // If the user doesn't have a cart, create a new one
    if (!cart) {
      cart = new Cart({ userId: currentUserID, products: [] });
      await cart.save();
    }

    // Send the cart as JSON response
    res.json(cart.formatCart());
  } catch (err) {
    // Handle errors
    console.error('Error occurred while getting cart', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while getting cart.',
    });
  }
};

/**
 * Controller function to add a product to the user's cart.
 * @returns JSON response confirming the product addition.
 */
const addToCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Find the product to add to the cart
    const product = await Product.findById(productId)
      .select('title price stock discountPercentage rating thumbnail category')
      .populate('category');

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId: currentUserID }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // If the user doesn't have a cart, create a new one with the added product
    if (!cart) {
      cart = new Cart({ userId: currentUserID, products: [{ product, quantity }] });
    } else {
      // If the user already has a cart, check if the product is already in the cart
      const existingItem = cart.products.find((item) => item.product._id.equals(productId));
      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.products.push({ product, quantity });
      }
    }

    // Save the cart with the added product
    await cart.save();

    // Send JSON response confirming the product addition
    res.status(200).json({
      message: 'Product added to cart successfully',
      cart: cart.formatCart(),
    });
  } catch (err) {
    // Handle errors
    console.error('Error adding product to cart:', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while adding product to cart.',
    });
  }
};

/**
 * Controller function to delete a product or clear the cart.
 * @returns JSON response confirming the product removal or cart clearing.
 */
const deleteCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    const { productId, cartId } = req.query;

    if (!productId && !cartId) {
      throw new Error('Please provide either productId or cartId');
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId: currentUserID }).populate({
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

    // Remove the product from the cart if productId is provided
    if (productId) {
      const indexToRemove = cart.products.findIndex((item) => item.product._id.equals(productId));
      if (indexToRemove === -1) {
        throw new Error('Product not found in cart');
      }
      cart.products.splice(indexToRemove, 1);
    }

    // Clear the entire cart if cartId is provided
    if (cartId) {
      cart.products = [];
    }

    // Save the updated cart
    await cart.save();

    // Send JSON response confirming the product removal or cart clearing
    res.status(200).json({
      message: 'Product removed from cart successfully',
      cart: cart.formatCart(),
    });
  } catch (err) {
    // Handle errors
    console.error('Error occurred while removing product from cart:', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while removing product from cart.',
    });
  }
};

module.exports = { getCart, addToCart, deleteCart };
