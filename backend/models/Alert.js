const mongoose = require('mongoose');

/**
 * Alert Schema
 * Price triggers set by users
 */
const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  stockSymbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,
    trim: true,
  },
  targetPrice: {
    type: Number,
    required: [true, 'Target price is required'],
    min: [0, 'Target price cannot be negative'],
  },
  condition: {
    type: String,
    enum: ['above', 'below'],
    required: [true, 'Condition is required'],
  },
  isTriggered: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
alertSchema.index({ user: 1 });
alertSchema.index({ isTriggered: 1, stockSymbol: 1 });

module.exports = mongoose.model('Alert', alertSchema);


