const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database Connected Successfully!!');
  } catch (err) {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
