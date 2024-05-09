'use strict';

// Importing required modules
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Define the User schema
const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    // Hashed Password of the user
    password: {
      type: String,
    },
  },
  // Options for schema (timestamps for created and updated)
  { timestamps: true },
);

// Method to compare password hash
UserSchema.methods.comparePassword = function (password) {
  // Compare password hash with provided password
  return bcrypt.compareSync(password, this.password);
};

// Define User model
const User = mongoose.model('User', UserSchema);

// Export User model
module.exports = User;
