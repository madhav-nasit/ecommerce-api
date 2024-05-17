'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

/**
 * Get the chat ID for a conversation between the current user and another user.
 * If the chat does not exist, a new chat is created.
 */
const getChatIdForUsers = async (req, res) => {
  try {
    const currentUserID = req.user._id;
    const { id } = req.params;

    // Check if a chat between the two users already exists
    const existingChat = await Chat.findOne({
      users: { $all: [currentUserID, id] },
    });

    if (existingChat) {
      // If a chat exists, return its chatId
      res.json(existingChat);
    } else {
      // If a chat doesn't exist, create a new chat and return its chatId
      const newChat = new Chat({ users: [currentUserID, id], messages: [] });
      await newChat.save();
      res.json(newChat);
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Error occurred while getting chat id.',
    });
  }
};

/**
 * Get chat threads for the current user along with the last message in each thread.
 */
const getChatThreads = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregation pipeline to find chat threads with the user and the last message
    const chatThreads = await Chat.aggregate([
      {
        $match: {
          users: userId,
        },
      },
      {
        $unwind: '$messages',
      },
      {
        $sort: {
          'messages.timestamp': -1,
        },
      },
      {
        $group: {
          _id: '$_id',
          users: {
            $first: '$users',
          },
          lastMessage: {
            $first: '$messages',
          },
        },
      },
      {
        $project: {
          _id: 1,
          users: 1,
          lastMessage: 1,
          otherUsers: {
            $filter: {
              input: '$users',
              as: 'user',
              cond: {
                $ne: ['$$user', userId],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users', // Collection name for users
          let: { otherUsers: '$otherUsers' },
          pipeline: [
            { $match: { $expr: { $in: ['$_id', '$$otherUsers'] } } },
            { $project: { password: 0 } }, // Exclude the password field
          ],
          as: 'user',
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          user: 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    // Return the chat threads with the last message
    res.status(200).send(chatThreads);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get new users who are not in a chat with the current user.
 */
const getNewUsers = async (req, res) => {
  try {
    const currentUserID = req.user._id;

    // Find users who are in a chat with the current user
    const chatThreads = await Chat.find({ users: currentUserID }).exec();

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
    const users = await User.find({ _id: { $ne: currentUserID, $nin: Array.from(userIDsInChat) } })
      .select('firstName lastName _id')
      .exec();

    return res.send(users);
  } catch (err) {
    return res.status(500).send({
      message: 'Error occurred while getting users.',
    });
  }
};

module.exports = { getChatIdForUsers, getChatThreads, getNewUsers };
