const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get user's portfolio
 * @route   GET /api/portfolio
 * @access  Private
 */
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id })
      .populate({
        path: 'positions.security',
        model: 'Security',
      });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    // Format positions with additional calculated fields
    const formattedPositions = portfolio.positions.map(position => {
      const security = position.security;
      const currentPrice = security ? security.currentPrice : 0;
      const totalValue = currentPrice * position.quantity;
      const avgCost = position.avgPrice * position.quantity;
      const pnl = totalValue - avgCost;
      const pnlPercent = avgCost > 0 ? (pnl / avgCost) * 100 : 0;

      return {
        id: position._id,
        security: security ? {
          id: security._id,
          symbol: security.symbol,
          name: security.name,
          type: security.type,
        } : null,
        symbol: position.symbol,
        type: position.type,
        quantity: position.quantity,
        avgPrice: position.avgPrice,
        currentPrice: currentPrice,
        totalValue: totalValue,
        pnl: pnl,
        pnlPercent: pnlPercent,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        balance: portfolio.balance,
        totalInvested: portfolio.totalInvested,
        positions: formattedPositions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deposit funds to portfolio
 * @route   POST /api/portfolio/deposit
 * @access  Private
 */
const deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0',
      });
    }

    // Find portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    // Update balance
    portfolio.balance += amount;
    await portfolio.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount: amount,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Deposit successful',
      data: {
        balance: portfolio.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw funds from portfolio
 * @route   POST /api/portfolio/withdraw
 * @access  Private
 */
const withdraw = async (req, res, next) => {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0',
      });
    }

    // Find portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found',
      });
    }

    // Check if sufficient balance
    if (portfolio.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    // Update balance
    portfolio.balance -= amount;
    await portfolio.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'withdraw',
      amount: amount,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        balance: portfolio.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's transaction history
 * @route   GET /api/portfolio/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions.map(tx => ({
        id: tx._id,
        type: tx.type,
        stockSymbol: tx.stockSymbol,
        amount: tx.amount,
        quantity: tx.quantity,
        priceAtTransaction: tx.priceAtTransaction,
        status: tx.status,
        date: tx.date,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  deposit,
  withdraw,
  getTransactions,
};

