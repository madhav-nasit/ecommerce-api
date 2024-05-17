const mongoose = require('mongoose');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
// Store online users
const onlineUsers = new Map();

/**
 * Socket.io event handlers for chat application.
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    /**
     * Handle socket connection error.
     */
    socket.on('error', (error) => {
      // You can handle the error here, such as logging it or emitting an error event to the client
      socket.emit('connection error', { message: 'Socket connection error', error });
    });

    /**
     * Handle user joining a chat.
     *
     * @param {Object} data - Data containing userId and chatId.
     */
    socket.on('join', async ({ userId, chatId }) => {
      socket.join(chatId);
      // Add user to online users
      onlineUsers.set(userId, socket.id);
      // Notify other users in the chat that this user is online
      socket.broadcast.to(chatId).emit('user online', { userId, online: true });

      // Fetch chat history after updating messages
      const chat = await Chat.findById(chatId).populate('users').populate('messages.sender');
      if (chat) {
        socket.emit('chat history', chat.messages);
        chat.users.forEach((user) => {
          if (user._id.toString() !== userId) {
            const isOnline = onlineUsers.has(user._id.toString());
            socket.emit('user online', { userId: user._id, online: isOnline });
          }
        });
      }
    });

    /**
     * Handle sending a message in a chat.
     *
     * @param {Object} data - Data containing chatId, senderId, and message.
     */
    socket.on('send message', async ({ chatId, senderId, message }) => {
      const chat = await Chat.findById(chatId).populate('users').populate('messages.sender');
      if (chat) {
        const sender = await User.findById(senderId);
        const newMessage = {
          _id: new mongoose.Types.ObjectId(),
          sender: sender,
          message,
          timestamp: new Date(),
          delivered: false,
          read: false,
        };
        chat.messages.push(newMessage);
        await chat.save();

        io.to(chatId).emit('new message', newMessage);
      }
    });

    /**
     * Handle user typing status in a chat.
     *
     * @param {Object} data - Data containing chatId, userId, and isTyping status.
     */
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.broadcast.to(chatId).emit('typing', { userId, isTyping });
    });

    /**
     * Handle user online status.
     *
     * @param {Object} data - Data containing chatId, userId, and online status.
     */
    socket.on('user online', ({ chatId, userId, online }) => {
      socket.broadcast.to(chatId).emit('user online', { userId, online });
    });

    /**
     * Handle user disconnection.
     */
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          disconnectedUserId = key;
          onlineUsers.delete(key);
        }
      });

      if (disconnectedUserId) {
        io.emit('user online', { userId: disconnectedUserId, online: false });
      }
    });
  });
};
