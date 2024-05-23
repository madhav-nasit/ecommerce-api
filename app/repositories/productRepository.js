'use strict';

const Product = require('../models/productModel');

/**
 * Counts the number of products matching the query.
 * @param {Object} query - The query object to match products.
 * @returns {Number} The count of matching products.
 */
const countProducts = async (query) => {
  return await Product.countDocuments(query);
};

/**
 * Finds products matching the query with optional pagination.
 * @param {Object} query - The query object to match products.
 * @returns {Array} An array of matching products.
 */
const findProducts = async (query) => {
  return await Product.find(query).populate('category');
};

/**
 * Finds a product by its ID.
 * @param {String} id - The ID of the product.
 * @returns {Object|null} The product object or null if not found.
 */
const findProductById = async (id) => {
  return await Product.findById(id).populate('category');
};

/**
 * Creates a new product.
 * @param {Object} productData - The data of the product to create.
 * @returns {Object} The created product object.
 */
const createProduct = async (productData) => {
  const product = new Product(productData);

  const thumbnailImage = await product.uploadImages(productData.thumbnail);
  product.thumbnail = thumbnailImage[0];

  const uploadedImages = await product.uploadImages(productData.images);
  product.images = uploadedImages;

  await product.save();
  return product;
};

/**
 * Updates an existing product by its ID.
 * @param {String} productId - The ID of the product to update.
 * @param {Object} updateData - The data to update the product with.
 * @returns {Object|null} The updated product object or null if not found.
 */
const updateProduct = async (productId, updateData) => {
  const product = await Product.findById(productId);
  if (product) {
    Object.assign(product, updateData);
    await product.save();
  }
  return product;
};

/**
 * Deletes a product by its ID.
 * @param {String} productId - The ID of the product to delete.
 * @returns {Object|null} The deleted product object or null if not found.
 */
const deleteProductById = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};

module.exports = {
  countProducts,
  findProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProductById,
};
