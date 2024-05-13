'use strict';

// Import required modules
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const userController = require('../controllers/userController');

router.get('/', userController.loginRequired, cartController.getCart);
router.post('/', userController.loginRequired, cartController.addToCart);
router.delete('/', userController.loginRequired, cartController.deleteCart);

module.exports = router;
