const mongoose = require('mongoose');

/**
 * SocialPost Schema
 * Community interactions
 */
const socialPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5005, 'Content cannot exceed 5005 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
socialPostSchema.index({ createdAt: -1 });
socialPostSchema.index({ user: 1 });

module.exports = mongoose.model('SocialPost', socialPostSchema);

