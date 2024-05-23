'use strict';

const cartRepository = require('../repositories/cartRepository');

const getCart = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const cart = await cartRepository.getUserCart(currentUserID);
    res.json(cart);
  } catch (error) {
    next('Error occurred while getting cart.');
  }
};

const addToCart = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const { productId, quantity } = req.body;
    const result = await cartRepository.addProductToCart(currentUserID, productId, quantity);
    res.status(200).json(result);
  } catch (error) {
    next('Error occurred while adding product to cart.');
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const { productId, cartId } = req.query;
    const result = await cartRepository.removeFromCart(currentUserID, productId, cartId);
    res.status(200).json(result);
  } catch (error) {
    next('Error occurred while removing product from cart.');
  }
};

module.exports = { getCart, addToCart, deleteCart };
