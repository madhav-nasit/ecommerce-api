'use strict';

// Importing required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Category schema
const CategorySchema = Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
