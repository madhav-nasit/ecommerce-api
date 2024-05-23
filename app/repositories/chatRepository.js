'use strict';

const Chat = require('../models/chatModel');

/**
 * Find a chat by users.
 * @param {Array} users - Array of user IDs.
 * @returns {Promise<Object|null>} - A promise that resolves to the chat object or null if not found.
 */
const findChatByUsers = async (users) => {
  const chats = await Chat.findOne({ users: { $all: users } }).populate(
    'users',
    '_id firstName lastName',
  );
  if (!!chats) {
    return {
      _id: chats._id,
      user: chats.users[1],
    };
  }
  return chats;
};

/**
 * Create a new chat.
 * @param {Object} chatData - The data for the new chat.
 * @returns {Promise<Object>} - A promise that resolves to the created chat object.
 */
const createChat = async (chatData) => {
  const newChat = await new Chat(chatData).populate('users', '_id firstName lastName');
  await newChat.save();
  return {
    _id: newChat._id,
    user: newChat.users[1],
  };
};

/**
 * Find chat threads for a user.
 * @param {Object} userId - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of chat threads.
 */
const findChatThreadsByUserId = async (userId) => {
  return await Chat.aggregate([
    { $match: { users: userId } },
    { $unwind: '$messages' },
    { $sort: { 'messages.timestamp': -1 } },
    { $group: { _id: '$_id', users: { $first: '$users' }, lastMessage: { $first: '$messages' } } },
    {
      $project: {
        _id: 1,
        users: 1,
        lastMessage: 1,
        otherUsers: { $filter: { input: '$users', as: 'user', cond: { $ne: ['$$user', userId] } } },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { otherUsers: '$otherUsers' },
        pipeline: [
          { $match: { $expr: { $in: ['$_id', '$$otherUsers'] } } },
          { $project: { password: 0 } },
        ],
        as: 'user',
      },
    },
    { $project: { _id: 1, lastMessage: 1, user: 1 } },
    { $unwind: '$user' },
  ]);
};

/**
 * Find chat threads for a user.
 * @param {Object} userId - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of chat threads.
 */
const findChatsByUserId = async (userId) => {
  return await Chat.find({ users: userId }).exec();
};

/**
 * Retrieves a chat by its ID.
 * @param {string} chatId - The ID of the chat.
 * @returns {Promise<Object|null>} - A promise that resolves to the chat object or null if not found.
 */
const getChatById = async (chatId) => {
  return await Chat.findById(chatId).populate('users').populate('messages.sender');
};

/**
 * Saves a chat.
 * @param {Object} chat - The chat object to be saved.
 * @returns {Promise<Object>} - A promise that resolves to the saved chat object.
 */
const saveChat = async (chat) => {
  return await chat.save();
};

module.exports = {
  findChatByUsers,
  createChat,
  findChatThreadsByUserId,
  findChatsByUserId,
  getChatById,
  saveChat,
};
