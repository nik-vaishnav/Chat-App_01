const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupDescription: {
    type: String,
    default: '',
    trim: true,
    maxlength: 300
  },
  groupIcon: {
    type: String,
    default: '',
    trim: true,
    match: [/^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif))?$/, 'Must be a valid image URL']
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const ConversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = ConversationModel;
