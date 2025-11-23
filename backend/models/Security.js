const mongoose = require('mongoose');

/**
 * Security Schema
 * Master list of tradable assets (Stocks/Crypto)
 */
const securitySchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['stock', 'crypto'],
    required: [true, 'Type is required'],
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative'],
  },
  marketCap: {
    type: String,
    default: null,
  },
  priceHistory: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Add current price to history before updating
securitySchema.pre('save', function (next) {
  if (this.isModified('currentPrice') && !this.isNew) {
    this.priceHistory.push({
      timestamp: new Date(),
      price: this.currentPrice,
    });
  }
  next();
});

module.exports = mongoose.model('Security', securitySchema);


