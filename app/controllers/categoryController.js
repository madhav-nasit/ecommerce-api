'use strict';

/**
 * Module dependencies.
 */
const Category = require('../models/categoryModel');

/**
 * Retrieve all categories.
 */
const categories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

/**
 * Add a new category.
 */
const addCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    return res.status(200).send(category);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

/**
 * Delete a category by ID.
 */
const deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  categories,
  addCategory,
  deleteCategoryById,
};
