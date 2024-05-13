'use strict';

// Module dependencies
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

/**
 * Controller function to get user's orders.
 * @returns JSON response containing user's orders.
 */
const getOrder = async (req, res) => {
  try {
    const currentUserID = req.user._id;

    // Find orders for the current user
    const order = await Order.find({ userId: currentUserID }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // Send the orders as JSON response
    res.json(order);
  } catch (err) {
    // Handle errors
    console.error('Error occurred while getting order', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while getting order.',
    });
  }
};

/**
 * Controller function to place an order for the current user.
 * @returns JSON response containing the placed order.
 */
const placeOrder = async (req, res) => {
  try {
    const currentUserID = req.user._id;

    // Find the cart for the current user
    const cart = await Cart.findOne({ userId: currentUserID });
    if (!cart) {
      throw new Error('Error getting valid cart to place order.');
    }

    if (cart.products.length <= 0) {
      throw new Error('Add product to cart before placing order.');
    }

    // Create a new order using the cart items
    const order = await new Order({ userId: currentUserID, products: cart.products }).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    // Calculate order amount
    order.calculateAmount();
    // Save the order
    await order.save();

    // Clear cart
    cart.products = [];
    // Save the cart
    await cart.save();

    // Send the placed order as JSON response
    res.json(order.formatOrder());
  } catch (err) {
    // Handle errors
    console.error('Error occurred while placing order', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while placing order.',
    });
  }
};

/**
 * Controller function to update the status of an order.
 * @returns JSON response containing the updated order.
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;

    // Find the order by its ID
    const order = await Order.findById(orderId).populate({
      path: 'products.product',
      select: 'title price stock discountPercentage rating thumbnail',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update the status
    order.status = status;

    // Save the updated order
    await order.save();

    // Send the updated order as JSON response
    res.json(order.formatOrder());
  } catch (err) {
    // Handle errors
    console.error('Error occurred while updating order status', err);
    res.status(400).send({
      message: err?.message || 'Error occurred while updating order status.',
    });
  }
};

module.exports = { getOrder, placeOrder, updateOrderStatus };
