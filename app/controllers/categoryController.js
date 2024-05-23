'use strict';

/**
 * Module dependencies.
 */
const categoryRepository = require('../repositories/categoryRepository');

/**
 * Retrieve all categories.
 */
const categories = async (req, res, next) => {
  try {
    const categories = await categoryRepository.getAllCategories();
    return res.status(200).json(categories);
  } catch (err) {
    next(`Error while fetching categories: ${err.message}`);
  }
};

/**
 * Add a new category.
 */
const addCategory = async (req, res, next) => {
  try {
    const category = await categoryRepository.createCategory(req.body);
    return res.status(200).send(category);
  } catch (err) {
    next(`Error while adding category: ${err.message}`);
  }
};

/**
 * Delete a category by ID.
 */
const deleteCategoryById = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryRepository.removeCategoryById(categoryId);
    if (!category) {
      next('Category not found');
    }
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(`Error while deleting category: ${error.message}`);
  }
};

module.exports = {
  categories,
  addCategory,
  deleteCategoryById,
};
