// Load environment variables from .env file
require('dotenv').config();

// Importing required modules
const express = require('express');
const corsMiddleware = require('./app/middlewares/corsMiddleware');
const bodyParserMiddleware = require('./app/middlewares/bodyParserMiddleware');
const errorHandlerMiddleware = require('./app/middlewares/errorHandlerMiddleware');
const routesMiddleware = require('./app/middlewares/routesMiddleware');
const notFoundMiddleware = require('./app/middlewares/notFoundMiddleware');
const connectDB = require('./app/middlewares/database');
const initializeSocket = require('./app/middlewares/socket');

// Initialize Express app
const app = express();

// Connect to MongoDB database
connectDB();

// Enable CORS for the app
app.use(corsMiddleware);

// Middleware to parse request body
app.use(bodyParserMiddleware);

// Routes
app.use(routesMiddleware);

// 404 Error handling
app.use(notFoundMiddleware);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Start the server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  // Server is running on port
});

// Initialize socket
initializeSocket(server);
