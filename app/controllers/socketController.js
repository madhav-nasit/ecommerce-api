const chatRepository = require('../repositories/chatRepository');
const userRepository = require('../repositories/userRepository');
const mongoose = require('mongoose');

/**
 * Handles user joining a chat.
 */
const handleJoin = async (socket, userId, chatId, onlineUsers, io) => {
  socket.join(chatId);
  onlineUsers.set(userId, socket.id);
  socket.broadcast.to(chatId).emit('user online', { userId, online: true });

  const chat = await chatRepository.getChatById(chatId);
  if (chat) {
    socket.emit('chat history', chat.messages);
    chat.users.forEach((user) => {
      if (user._id.toString() !== userId) {
        const isOnline = onlineUsers.has(user._id.toString());
        socket.emit('user online', { userId: user._id, online: isOnline });
      }
    });
  }
};

/**
 * Handles sending a message in a chat.
 */
const handleSendMessage = async (socket, chatId, senderId, message, onlineUsers, io) => {
  const chat = await chatRepository.getChatById(chatId);
  if (chat) {
    const sender = await userRepository.findUserById(senderId);
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: sender,
      message,
      timestamp: new Date(),
      delivered: false,
      read: false,
    };
    chat.messages.push(newMessage);
    await chatRepository.saveChat(chat);

    io.to(chatId).emit('new message', newMessage);
  }
};

/**
 * Handles user disconnecting.
 */
const handleDisconnect = (socket, onlineUsers, io) => {
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
};

/**
 * Socket.io event handlers for chat application.
 */
module.exports = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    socket.on('error', (error) => {
      socket.emit('connection error', { message: 'Socket connection error', error });
    });

    socket.on('join', async ({ userId, chatId }) => {
      await handleJoin(socket, userId, chatId, onlineUsers, io);
    });

    socket.on('send message', async ({ chatId, senderId, message }) => {
      await handleSendMessage(socket, chatId, senderId, message, onlineUsers, io);
    });

    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.broadcast.to(chatId).emit('typing', { userId, isTyping });
    });

    socket.on('user online', ({ chatId, userId, online }) => {
      socket.broadcast.to(chatId).emit('user online', { userId, online });
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket, onlineUsers, io);
    });
  });
};
