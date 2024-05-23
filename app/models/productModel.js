'use strict';

/**
 * Module dependencies.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ImageKit = require('imagekit');
const Schema = mongoose.Schema;

/**
 * Define the Product schema.
 */
const ProductSchema = Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  discountPercentage: Number,
  rating: Number,
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  thumbnail: {
    type: String,
    required: true,
  },
  images: [String],
});

/**
 * Create an ImageKit instance for image uploading.
 */
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Define a method to upload images to ImageKit.
 * @param {Array} images - Array of image files to upload.
 * @returns {Array} - Array of URLs of the uploaded images.
 * @throws {Error} - Throws an error if image upload fails.
 */
ProductSchema.methods.uploadImages = async function (images) {
  try {
    const uploadedImages = [];
    for (const image of images) {
      const result = await imagekit.upload({
        file: image.buffer.toString('base64'),
        fileName: image.originalname,
        folder: 'product_images',
      });
      uploadedImages.push(result.url);
    }
    return uploadedImages;
  } catch (error) {
    throw new Error('Failed to upload images to ImageKit');
  }
};

/**
 * Product model representing products in the database.
 */
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
