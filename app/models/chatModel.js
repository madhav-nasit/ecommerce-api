const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Chat Schema
 *
 * This schema defines the structure of the Chat documents stored in the MongoDB collection.
 */
const ChatSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Chat', ChatSchema);
