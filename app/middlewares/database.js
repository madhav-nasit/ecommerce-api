const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (err) {
    process.exit(1);
  }
};

module.exports = connectDB;
