'use strict';

// Importing required modules
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for user sign-up
router.post('/sign-up', userController.signUp);

// Route for user sign-in
router.post('/sign-in', userController.signIn);

// Route for user profile (requires login)
router.get('/profile', userController.loginRequired, userController.profile);

// Exporting router to use in the main application
module.exports = router;
