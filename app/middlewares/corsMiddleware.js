const cors = require('cors');

const corsMiddleware = cors({
  origin: '*', // Allow all origins, you can restrict it to specific origins if needed
  methods: ['GET', 'POST'],
  // allowedHeaders: ['my-custom-header'],
  credentials: true,
});

module.exports = corsMiddleware;
