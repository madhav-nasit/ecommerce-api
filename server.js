// Load environment variables from .env file
require('dotenv').config();

// Importing required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const UserRoutes = require('./app/routes/userRoutes');
const ProductRoutes = require('./app/routes/productRoutes');
const secret = process.env.SECRET_KEY;

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

// Middleware for JWT verification
app.use(async (req, res, next) => {
  try {
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      const user = await jwt.verify(req.headers.authorization.split(' ')[1], secret);
      if (!!user) {
        user.iat = undefined;
        req.user = user;
      } else {
        req.user = undefined;
      }
    } else {
      req.user = undefined;
    }
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    req.user = undefined;
    next(err); // Pass error to error handling middleware
  }
});

// Routes
app.use('/api/auth', UserRoutes);
app.use('/api/product', ProductRoutes);

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
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
