'use strict';

/**
 * Module dependencies.
 */
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

/**
 * Controller function to get user's cart.
 */
const getCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    let cart = await Cart.findOne({ userId: currentUserID }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });
    if (!cart) {
      cart = new Cart({ userId: currentUserID, products: [] });
      await cart.save();
    }
    res.json(cart.formatCart());
  } catch (err) {
    console.error('Error occurred while getting cart', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while getting cart.',
    });
  }
};

/**
 * Controller function to add a product to the user's cart.
 */
const addToCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId)
      .select('title price stock discountPercentage rating thumbnail category')
      .populate('category');
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if the user already has a cart
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

    await cart.save();
    res.status(200).json({
      message: 'Product added to cart successfully',
      cart: cart.formatCart(),
    });
  } catch (err) {
    console.error('Error adding product to cart:', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while adding product to cart.',
    });
  }
};

/**
 * Controller function to delete a product or clear the cart.
 */
const deleteCart = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    const { productId, cartId } = req.body;

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
    res.status(200).json({
      message: 'Product removed from cart successfully',
      cart: cart.formatCart(),
    });
  } catch (err) {
    console.error('Error occurred while removing product from cart:', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while removing product from cart.',
    });
  }
};

module.exports = { getCart, addToCart, deleteCart };
