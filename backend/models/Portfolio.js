const mongoose = require('mongoose');

/**
 * Portfolio Schema
 * The core financial container for a user
 */
const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true, // One portfolio per user
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: [0, 'Total invested cannot be negative'],
  },
  positions: [{
    security: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Security',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['stock', 'crypto'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    avgPrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative'],
    },
  }],
}, {
  timestamps: true,
});

// Index for faster queries
portfolioSchema.index({ user: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);


