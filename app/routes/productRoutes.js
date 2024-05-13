'use strict';

// Import required modules
const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const productUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// <-- Routes for categories -->
// Get all categories
router.get('/categories', categoryController.categories);

// Add a new category
router.post('/categories', categoryController.addCategory);

// Delete a category by ID
router.delete('/categories/:id', categoryController.deleteCategoryById);

// <-- Routes for products -->
// Get products with optional filtering and pagination
router.get('/', productController.getProducts);

// Add a new product
router.post('/', productUpload, productController.addProduct);

// Edit an existing product
router.patch('/:id', productUpload, productController.editProduct);

// Delete a product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
