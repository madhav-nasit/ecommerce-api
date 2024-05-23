'use strict';

const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const productRepository = require('./productRepository');

/**
 * Finds orders for a user by user ID.
 * @param {String} userId - The user ID.
 * @returns {Promise<Array>} - A promise that resolves to an array of orders.
 */
const findOrdersByUserId = async (userId) => {
  return await Order.find({ userId }).populate({
    path: 'products.product',
    select: 'title price stock discountPercentage rating thumbnail',
    populate: {
      path: 'category',
      select: 'name',
    },
  });
};

/**
 * Finds a cart for a user by user ID.
 * @param {String} userId - The user ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the cart object or null if not found.
 */
const findCartByUserId = async (userId) => {
  return await Cart.findOne({ userId });
};

/**
 * Creates a new order.
 * @param {Object} orderData - The order data.
 * @returns {Promise<Object>} - A promise that resolves to the created order.
 */
const createOrder = async (orderData) => {
  const order = await new Order(orderData).populate({
    path: 'products.product',
    select: 'title price stock discountPercentage rating thumbnail',
    populate: {
      path: 'category',
      select: 'name',
    },
  });
  order.calculateAmount();
  await saveOrder(order);

  await Promise.all(
    order.products.map(async (item) => {
      const product = item.product;
      const updatedStock = product.stock - item.quantity;
      await productRepository.updateProductStock(product._id, updatedStock);
    }),
  );

  return order;
};

/**
 * Clears the products in a cart.
 * @param {Object} cart - The cart object.
 * @returns {Promise<Object>} - A promise that resolves to the updated cart.
 */
const clearCartProducts = async (cart) => {
  cart.products = [];
  return await cart.save();
};

/**
 * Finds an order by its ID.
 * @param {String} orderId - The order ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the order object or null if not found.
 */
const findOrderById = async (orderId) => {
  return await Order.findById(orderId).populate({
    path: 'products.product',
    select: 'title price stock discountPercentage rating thumbnail',
    populate: {
      path: 'category',
      select: 'name',
    },
  });
};

/**
 * Saves an order.
 * @param {Object} order - The order object.
 * @returns {Promise<Object>} - A promise that resolves to the saved order.
 */
const saveOrder = async (order) => {
  return await order.save();
};

/**
 * Aggregates the top bestseller products.
 * @param {Number} limit - The limit of products to fetch.
 * @returns {Promise<Array>} - A promise that resolves to an array of bestseller products.
 */
const aggregateBestsellerProducts = async (limit) => {
  return await Order.aggregate([
    {
      $unwind: {
        path: '$products',
      },
    },
    {
      $group: {
        _id: '$products.product',
        orderCount: {
          $sum: '$products.quantity',
        },
      },
    },
    {
      $sort: {
        orderCount: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $addFields: {
        category: {
          $arrayElemAt: ['$category', 0],
        },
      },
    },
    {
      $addFields: {
        'product.category': '$category.name',
      },
    },
    {
      $addFields: {
        product: {
          $arrayElemAt: ['$product', 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        orderCount: 1,
        product: 1,
      },
    },
  ]);
};

/**
 * Aggregates the products frequently bought together with a specified product.
 * @param {String} productId - The product ID.
 * @param {Number} limit - The limit of products to fetch.
 * @returns {Promise<Array>} - A promise that resolves to an array of products bought together.
 */
const aggregateProductsBoughtTogether = async (productId, limit) => {
  const objectId = new mongoose.Types.ObjectId(productId);
  return await Order.aggregate([
    {
      $match: {
        'products.product': objectId,
      },
    },
    {
      $unwind: {
        path: '$products',
      },
    },
    {
      $group: {
        _id: '$products.product',
        totalBoughtTogether: {
          $sum: '$products.quantity',
        },
      },
    },
    {
      $match: {
        _id: {
          $ne: objectId,
        },
      },
    },
    {
      $sort: {
        totalBoughtTogether: -1,
      },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $addFields: {
        category: {
          $arrayElemAt: ['$category', 0],
        },
      },
    },
    {
      $addFields: {
        'product.category': '$category.name',
      },
    },
    {
      $addFields: {
        product: {
          $arrayElemAt: ['$product', 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalBoughtTogether: 1,
        product: 1,
      },
    },
  ]);
};

module.exports = {
  findOrdersByUserId,
  findCartByUserId,
  createOrder,
  clearCartProducts,
  findOrderById,
  saveOrder,
  aggregateBestsellerProducts,
  aggregateProductsBoughtTogether,
};
