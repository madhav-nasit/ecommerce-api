'use strict';

/**
 * Module dependencies.
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const secret = process.env.SECRET_KEY;

/**
 * Registers a new user.
 */
const signUp = async (req, res) => {
  try {
    const newUser = new User(req.body);
    newUser.password = bcrypt.hashSync(req.body.password, 10);
    const user = await newUser.save();
    // Omit password field from the response
    user.password = undefined;
    return res.send(user);
  } catch (err) {
    console.log('Error', err);
    if (err && err?.code === 11000) {
      return res.status(400).send({
        message: 'User already exists with given email.',
      });
    } else {
      return res.status(500).send({
        message: err?.message || 'Error occurred while creating user.',
      });
    }
  }
};

/**
 * Authenticates a user.
 */
const signIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user || !user.comparePassword(req.body.password)) {
      return res.status(400).json({ message: 'Authentication failed. Invalid email or password.' });
    }
    // Omit password field from the response
    user.password = undefined;
    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, firstName: user.firstName, lastName: user.lastName, _id: user._id },
      secret,
    );
    return res.json({
      ...user.toObject(),
      token: token,
    });
  } catch (err) {
    return res.status(500).send({
      message: err?.message || 'Error occurred while authenticating user.',
    });
  }
};

/**
 * Middleware to check if user is logged in.
 */
const loginRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized user!!' });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({ message: 'Unauthorized user!!' });
  }
};

/**
 * Fetches user profile.
 */
const profile = async (req, res) => {
  return res.send(req.user);
};

module.exports = { signUp, signIn, loginRequired, profile };
