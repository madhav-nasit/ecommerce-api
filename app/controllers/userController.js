'use strict';

/**
 * Module dependencies.
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/userRepository');
const secret = process.env.SECRET_KEY;

/**
 * Registers a new user.
 */
const signUp = async (req, res, next) => {
  try {
    const userData = { ...req.body, password: bcrypt.hashSync(req.body.password, 10) };
    const user = await UserRepository.createUser(userData);
    user.password = undefined;
    res.json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      next('User already exists with given email.');
    } else {
      next('Error occurred while creating user.');
    }
  }
};

/**
 * Authenticates a user.
 */
const signIn = async (req, res, next) => {
  try {
    const user = await UserRepository.findUserByEmail(req.body.email);
    if (!user || !user.comparePassword(req.body.password)) {
      next('Authentication failed. Invalid email or password.');
    } else {
      user.password = undefined;
      const token = jwt.sign(
        { email: user.email, firstName: user.firstName, lastName: user.lastName, _id: user._id },
        secret,
        { expiresIn: '1h' },
      );
      res.json({
        ...user.toObject(),
        token: token,
      });
    }
  } catch (err) {
    next('Error occurred while authenticating user.');
  }
};

/**
 * Middleware to check if user is logged in.
 */
const loginRequired = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    next('Unauthorized user!!');
  } else {
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401);
      next('Unauthorized user!!');
    }
  }
};

/**
 * Fetches user profile.
 */
const profile = async (req, res, next) => {
  try {
    const user = await UserRepository.findUserById(req.user._id);
    user.password = undefined;
    res.send(user);
  } catch (err) {
    next('Error occurred while getting user.');
  }
};

/**
 * Fetches all users except the current user.
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await UserRepository.findAllUsersExcept(req.user._id);
    res.send(users);
  } catch (err) {
    next('Error occurred while getting users.');
  }
};

module.exports = { signUp, signIn, loginRequired, profile, getUsers };
