'use strict';

/**
 * Module dependencies.
 */
const OrderRepository = require('../repositories/orderRepository');

/**
 * Controller function to get user's orders.
 * @returns JSON response containing user's orders.
 */
const getOrder = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const order = await OrderRepository.findOrdersByUserId(currentUserID);
    res.json(order);
  } catch (err) {
    next('Error occurred while getting order.');
  }
};

/**
 * Controller function to place an order for the current user.
 * @returns JSON response containing the placed order.
 */
const placeOrder = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const cart = await OrderRepository.findCartByUserId(currentUserID);
    if (!cart) {
      next('Error getting valid cart to place order.');
    }
    if (cart.products.length <= 0) {
      next('Add product to cart before placing order.');
    }

    // create an order and update the stock
    const order = await OrderRepository.createOrder({
      userId: currentUserID,
      products: cart.products,
    });

    // Clear cart items in order place
    await OrderRepository.clearCartProducts(cart);

    res.json(order.formatOrder());
  } catch (err) {
    next('Error occurred while placing order.');
  }
};

/**
 * Controller function to update the status of an order.
 * @returns JSON response containing the updated order.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;
    const order = await OrderRepository.findOrderById(orderId);

    if (!order) {
      next('Order not found');
    }

    order.status = status;
    await OrderRepository.saveOrder(order);

    res.json(order.formatOrder());
  } catch (err) {
    next('Error occurred while updating order status.');
  }
};

/**
 * Fetches the top 10 bestseller products based on the quantity sold.
 */
const getBestsellerProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.params;
    const bestsellerProducts = await OrderRepository.aggregateBestsellerProducts(limit);
    res.json(bestsellerProducts);
  } catch (err) {
    next('Error occurred while getting bestseller products.');
  }
};

/**
 * Fetches the top 10 products frequently bought together with the specified product.
 */
const getProductsBoughtTogether = async (req, res, next) => {
  try {
    const { productId, limit = 10 } = req.params;
    const boughtTogether = await OrderRepository.aggregateProductsBoughtTogether(productId, limit);
    res.json(boughtTogether);
  } catch (err) {
    next('Error occurred while getting products bought together.');
  }
};

module.exports = {
  getOrder,
  placeOrder,
  updateOrderStatus,
  getBestsellerProducts,
  getProductsBoughtTogether,
};
