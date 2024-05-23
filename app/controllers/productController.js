'use strict';

const Product = require('../models/productModel');
const ProductRepository = require('../repositories/productRepository');
const CategoryRepository = require('../repositories/categoryRepository');
const { paginate } = require('../utils/helper');

/**
 * Retrieves a list of products based on optional query parameters.
 * @returns {Object} Response with list of products, pagination details, and total count.
 */
const getProducts = async (req, res, next) => {
  try {
    // Extract query parameters
    const { category, page, limit } = req.query;
    let query = {};

    // If category is provided, filter by category
    if (category) {
      const categoryObj = await CategoryRepository.findCategoryByName(category);
      if (!categoryObj) {
        next('No category found.');
      }
      query.category = categoryObj._id;
    }

    // Paginate the products
    const {
      items: products,
      totalItems,
      currentPage,
      totalPages,
    } = await paginate(Product, query, page, limit, 'category');

    // Format category as "category": "smartphones"
    const formattedProducts = products.map((product) => ({
      ...product.toJSON(),
      category: product?.category.name,
    }));

    res.status(200).json({
      products: formattedProducts,
      count: totalItems,
      page: currentPage,
      total: totalPages,
    });
  } catch (error) {
    next('Error while getting products.');
  }
};

/**
 * Retrieves a single product based on the provided product ID.
 * @returns {Object} Response with the product details or an error message.
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the product by ID and populate its category
    const product = await ProductRepository.findProductById(id);

    if (!product) {
      next('Product not found.');
    }

    // Format the product response to include category name
    const formattedProduct = {
      ...product.toJSON(),
      category: product?.category.name,
    };

    // Return the product
    res.status(200).json(formattedProduct);
  } catch (error) {
    next('Error while getting product details.');
  }
};

/**
 * Adds a new product.
 * @returns {Object} Response with success message and added product details.
 */
const addProduct = async (req, res, next) => {
  try {
    const { title, description, price, stock, discountPercentage, rating, category } = req.body;
    const thumbnail = req.files['thumbnail'];
    const images = req.files['images'];

    if (!title || !description || !price || !stock || !category) {
      next('Missing required fields.');
    }

    const categoryObj = await CategoryRepository.findCategoryById(category);
    if (!categoryObj) {
      next('Category not found');
    }

    const productData = {
      title,
      description,
      price,
      stock,
      discountPercentage,
      rating,
      category,
      thumbnail,
      images,
    };

    const product = await ProductRepository.createProduct(productData);

    res.status(200).json({
      message: 'Product added successfully',
      product: { ...product.toJSON(), category: categoryObj.name },
    });
  } catch (error) {
    let errMsg = 'Error ehile adding the product';
    if (error && error?.code === 11000) {
      errMsg = 'Product already exists with given title.';
    }
    next(errMsg);
  }
};

/**
 * Edits an existing product.
 * @returns {Object} Response with success message and updated product details.
 */
const editProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { title, description, price, stock, discountPercentage, rating, category } = req.body;

    if (!title || !description || !price || !stock || !category) {
      next('Missing required fields.');
    }

    const product = await ProductRepository.findProductById(productId);
    if (!product) {
      next('Product not found');
    }

    const categoryObj = await CategoryRepository.findCategoryById(category);
    if (!categoryObj) {
      next('Category not found');
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

    const updateData = {
      title,
      description,
      price,
      stock,
      discountPercentage,
      rating,
      category,
    };

    const updatedProduct = await ProductRepository.updateProduct(productId, updateData);

    res.status(200).json({
      message: 'Product updated successfully',
      product: { ...updatedProduct.toJSON(), category: categoryObj.name },
    });
  } catch (error) {
    next('Error while updating the product.');
  }
};

/**
 * Deletes a product by its ID.
 * @returns {Object} Response with success message or error message if product not found.
 */
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await ProductRepository.deleteProductById(productId);

    if (!product) {
      next('Product not found');
    } else {
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    next('Error while deleting the product.');
  }
};

module.exports = { getProducts, getProductById, addProduct, editProduct, deleteProduct };
