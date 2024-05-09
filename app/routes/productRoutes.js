'use strict';

// Importing required modules
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Routes for categories
router.get('/categories', categoryController.categories);
router.post('/categories', categoryController.addCategory);
router.delete('/categories/:id', categoryController.deleteCategoryById);

// Exporting router to use in the main application
module.exports = router;
