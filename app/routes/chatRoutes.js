'use strict';

// Import required modules
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const chatController = require('../controllers/chatController');

/**
 * Route to get the chat ID for a conversation between the current user and another user.
 * If the chat does not exist, a new chat is created.
 */
router.get('/chat-id/:id', userController.loginRequired, chatController.getChatIdForUsers);

/**
 * Route to get chat threads for the current user along with the last message in each thread.
 */
router.get('/', userController.loginRequired, chatController.getChatThreads);

/**
 * Route to get new users who are not in a chat with the current user.
 */
router.get('/new-users', userController.loginRequired, chatController.getNewUsers);

module.exports = router;
