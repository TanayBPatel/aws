const mongoose = require('mongoose');

/**
 * Transaction Schema
 * Ledger of all money movements
 */
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'deposit', 'withdraw'],
    required: [true, 'Transaction type is required'],
  },
  stockSymbol: {
    type: String,
    required: function () {
      return this.type === 'buy' || this.type === 'sell';
    },
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  quantity: {
    type: Number,
    required: function () {
      return this.type === 'buy' || this.type === 'sell';
    },
    min: [0, 'Quantity cannot be negative'],
  },
  priceAtTransaction: {
    type: Number,
    required: function () {
      return this.type === 'buy' || this.type === 'sell';
    },
    min: [0, 'Price cannot be negative'],
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'pending'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);


