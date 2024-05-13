'use strict';

// Import required modules
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');

// Route to get user's orders
router.get('/', userController.loginRequired, orderController.getOrder);

// Route to place a new order for the current user
router.post('/', userController.loginRequired, orderController.placeOrder);

// Route to update the status of an order
router.put('/status/:id', userController.loginRequired, orderController.updateOrderStatus);

module.exports = router;
