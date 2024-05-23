'use strict';

/**
 * Module dependencies.
 */
const Category = require('../models/categoryModel');

/**
 * Retrieve all categories.
 * @returns {Promise<Array>} - A promise that resolves to an array of categories.
 */
const getAllCategories = async () => {
  return await Category.find();
};

/**
 * Finds a category by its name.
 * @param {String} name - The name of the category.
 * @returns {Object|null} The category object or null if not found.
 */
const findCategoryByName = async (name) => {
  return await Category.findOne({ name });
};

/**
 * Finds a category by its ID.
 * @param {String} categoryId - The ID of the category.
 * @returns {Object|null} The category object or null if not found.
 */
const findCategoryById = async (categoryId) => {
  return await Category.findById(categoryId);
};

/**
 * Add a new category.
 * @param {Object} categoryData - The category data to be saved.
 * @returns {Promise<Object>} - A promise that resolves to the saved category object.
 */
const createCategory = async (categoryData) => {
  const category = new Category(categoryData);
  return await category.save();
};

/**
 * Delete a category by ID.
 * @param {String} categoryId - The ID of the category to be deleted.
 * @returns {Promise<Object|null>} - A promise that resolves to the deleted category object or null if not found.
 */
const removeCategoryById = async (categoryId) => {
  return await Category.findByIdAndDelete(categoryId);
};

module.exports = {
  findCategoryByName,
  findCategoryById,
  getAllCategories,
  createCategory,
  removeCategoryById,
};
