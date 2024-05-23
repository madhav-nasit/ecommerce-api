'use strict';

// Module dependencies
const mongoose = require('mongoose');
const chatRepository = require('../repositories/chatRepository');
const userRepository = require('../repositories/userRepository');

/**
 * Get the chat ID for a conversation between the current user and another user.
 * If the chat does not exist, a new chat is created.
 */
const getChatIdForUsers = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;
    const { id } = req.params;

    // Check if a chat between the two users already exists
    const existingChat = await chatRepository.findChatByUsers([currentUserID, id]);

    if (existingChat) {
      // If a chat exists, return its chatId
      res.json(existingChat);
    } else {
      // If a chat doesn't exist, create a new chat and return its chatId
      const newChat = await chatRepository.createChat({ users: [currentUserID, id], messages: [] });
      res.json(newChat);
    }
  } catch (error) {
    next('Error occurred while getting chat id.');
  }
};

/**
 * Get chat threads for the current user along with the last message in each thread.
 */
const getChatThreads = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregation pipeline to find chat threads with the user and the last message
    const chatThreads = await chatRepository.findChatThreadsByUserId(userId);

    // Return the chat threads with the last message
    res.json(chatThreads);
  } catch (error) {
    next('Error occurred while getting chat threads.');
  }
};

/**
 * Get new users who are not in a chat with the current user.
 */
const getNewUsers = async (req, res, next) => {
  try {
    const currentUserID = req.user._id;

    // Find users who are in a chat with the current user
    const chatThreads = await chatRepository.findChatsByUserId(currentUserID);

    // Extract user IDs who are in a chat with the current user
    const userIDsInChat = new Set();
    chatThreads.forEach((thread) => {
      thread.users.forEach((userID) => {
        if (!userID.equals(currentUserID) && thread.messages.length > 0) {
          userIDsInChat.add(userID.toString());
        }
      });
    });

    // Find users who are not in a chat with the current user
    const users = await userRepository.findNewUsers(currentUserID, Array.from(userIDsInChat));

    res.json(users);
  } catch (err) {
    next('Error occurred while getting new users.');
  }
};

module.exports = { getChatIdForUsers, getChatThreads, getNewUsers };
