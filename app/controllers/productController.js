'use strict';

const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

/**
 * Retrieves a list of products based on optional query parameters.
 * @returns {Object} Response with list of products, pagination details, and total count.
 */
const getProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { category, page, limit } = req.query;
    let query = {};

    // If category is provided, filter by category
    if (category) {
      const categoryObj = await Category.findOne({ name: category });
      if (!categoryObj) {
        throw new Error('No category found.');
      }
      query.category = categoryObj._id;
    }

    // Count total products
    const totalProducts = await Product.countDocuments(query);

    let currentPage = 1;
    let totalPages = 1;
    let productsQuery = Product.find(query).populate('category');

    // If page and limit are provided, apply pagination
    if (page && limit) {
      currentPage = parseInt(page);
      totalPages = Math.ceil(totalProducts / limit);
      if (totalPages != 0 && currentPage > totalPages) {
        throw new Error('Page number is out of bounds.');
      }
      const skip = (currentPage - 1) * limit;
      productsQuery = productsQuery.skip(skip).limit(parseInt(limit));
    }

    // Query products with filters and pagination
    const products = await productsQuery.exec();

    // Format category as "category": "smartphones"
    const formattedProducts = products.map((product) => ({
      ...product.toJSON(),
      category: product?.category.name,
    }));

    // Return products
    res.json({
      products: formattedProducts,
      count: totalProducts,
      page: currentPage,
      total: totalPages,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(400).json({ error: error.message || 'Internal Server Error' });
  }
};

/**
 * Adds a new product.
 * @returns {Object} Response with success message and added product details.
 */
const addProduct = async (req, res) => {
  try {
    const { title, description, price, stock, discountPercentage, rating, category } = req.body;
    const thumbnail = req.files['thumbnail'];
    const images = req.files['images'];

    if (!title || !description || !price || !stock || !category) {
      throw new Error('Missing required fields.');
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      throw new Error('Category not found');
    }

    const product = new Product({
      title,
      description,
      price,
      stock,
      discountPercentage,
      rating,
      category,
      thumbnail,
    });

    const thumbnailImage = await product.uploadImages(thumbnail);
    product.thumbnail = thumbnailImage[0];

    const uploadedImages = await product.uploadImages(images);
    product.images = uploadedImages;

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product: { ...product.toJSON(), category: categoryObj.name },
    });
  } catch (error) {
    if (error && error?.code === 11000) {
      return res.status(400).send({
        message: 'Product already exists with given title.',
      });
    } else {
      console.error('Error adding product:', error);
      res.status(400).json({ error: error?.message || 'Bad Request' });
    }
  }
};

/**
 * Edits an existing product.
 * @returns {Object} Response with success message and updated product details.
 */
const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, stock, discountPercentage, rating, category } = req.body;

    if (!title || !description || !price || !stock || !category) {
      throw new Error('Missing required fields.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      throw new Error('Category not found');
    }

    const thumbnail = req.files['thumbnail'];
    const images = req.files['images'];

    if (thumbnail) {
      const thumbnailImage = await product.uploadImages(thumbnail);
      product.thumbnail = thumbnailImage[0];
    }

    if (images) {
      const uploadedImages = await product.uploadImages(images);
      product.images = uploadedImages;
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.discountPercentage = discountPercentage;
    product.rating = rating;
    product.category = category;

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product: { ...product.toJSON(), category: categoryObj.name },
    });
  } catch (error) {
    console.error('Error editing product:', error);
    res.status(400).json({ error: error?.message || 'Bad Request' });
  }
};

/**
 * Deletes a product by its ID.
 * @returns {Object} Response with success message or error message if product not found.
 */
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ error: error?.message || 'Internal Server Error' });
  }
};

module.exports = { getProducts, addProduct, editProduct, deleteProduct };
