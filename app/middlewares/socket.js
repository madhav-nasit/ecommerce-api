const socketIo = require('socket.io');
const socketController = require('../controllers/socketController');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: '*', // Allow all origins, you can restrict it to specific origins if needed
      methods: ['GET', 'POST'],
      // allowedHeaders: ['my-custom-header'],
      credentials: true,
    },
  });

  socketController(io);
};

module.exports = initializeSocket;
