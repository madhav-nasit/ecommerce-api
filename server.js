// Load environment variables from .env file
require('dotenv').config();

// Importing required modules
const express = require('express');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRoutes = require('./app/routes/userRoutes');
const ProductRoutes = require('./app/routes/productRoutes');
const CartRoutes = require('./app/routes/cartRoutes');
const OrderRoutes = require('./app/routes/orderRoutes');
const ChatRoutes = require('./app/routes/chatRoutes');
const socketController = require('./app/controllers/socketController');

// Initialize Express app
const app = express();

// Connect to MongoDB database
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Database Connected Successfully!!');
  })
  .catch((err) => {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  });

// Enable cors for app
app.use(cors());

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', UserRoutes);
app.use('/api/product', ProductRoutes);
app.use('/api/cart', CartRoutes);
app.use('/api/order', OrderRoutes);
app.use('/api/chat', ChatRoutes);

// 404 Error handling
app.use((req, res) => {
  res.status(404).send({ error: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).send({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const io = socketIo(server);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins, you can restrict it to specific origins if needed
    methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

// Load socket controller
socketController(io);
