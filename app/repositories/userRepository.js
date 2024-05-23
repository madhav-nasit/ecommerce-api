'use strict';

/**
 * Module dependencies.
 */
const User = require('../models/userModel');

/**
 * Create a new user.
 * @param {Object} userData - The user data to be saved.
 * @returns {Promise<Object>} - A promise that resolves to the saved user object.
 */
const createUser = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

/**
 * Finds a user by email.
 * @param {String} email - The email of the user.
 * @returns {Object|null} The user object or null if not found.
 */
const findUserByEmail = async (email) => {
  return await User.findOne({ email }).exec();
};

/**
 * Finds a user by ID.
 * @param {String} userId - The ID of the user.
 * @returns {Object|null} The user object or null if not found.
 */
const findUserById = async (userId) => {
  return await User.findById(userId).exec();
};

/**
 * Finds all users except the current user.
 * @param {String} currentUserID - The ID of the current user.
 * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
 */
const findAllUsersExcept = async (currentUserID) => {
  return await User.find({ _id: { $ne: currentUserID } })
    .select('firstName lastName _id')
    .exec();
};

/**
 * Find users who are not in the given array of user IDs.
 * @param {Object} currentUserID - The ID of the current user.
 * @param {Array} excludeUserIDs - Array of user IDs to exclude.
 * @returns {Promise<Array>} - A promise that resolves to an array of users.
 */
const findNewUsers = async (currentUserID, excludeUserIDs) => {
  return await User.find({ _id: { $ne: currentUserID, $nin: excludeUserIDs } })
    .select('firstName lastName _id')
    .exec();
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsersExcept,
  findNewUsers,
};
