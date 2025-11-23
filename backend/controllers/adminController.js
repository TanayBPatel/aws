const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithPortfolio = await Promise.all(
      users.map(async (user) => {
        const portfolio = await Portfolio.findOne({ user: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          status: 'active', // Can be extended with actual status field
          walletBalance: portfolio ? portfolio.balance : 0,
          totalInvested: portfolio ? portfolio.totalInvested : 0,
          joinedDate: user.joinedDate || user.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithPortfolio.length,
      data: usersWithPortfolio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system statistics
 * @route   GET /api/admin/system
 * @access  Private (Admin)
 */
const getSystemStats = async (req, res, next) => {
  try {
    // Calculate system metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ role: 'investor' });
    const totalPortfolios = await Portfolio.countDocuments();

    // Calculate Total AUM (Assets Under Management)
    const portfolios = await Portfolio.find();
    let totalAUM = 0;
    
    for (const portfolio of portfolios) {
      totalAUM += portfolio.balance;
      // Add value of all positions
      for (const position of portfolio.positions) {
        const security = await require('../models/Security').findById(position.security);
        if (security) {
          totalAUM += security.currentPrice * position.quantity;
        }
      }
    }

    // Mock system stats
    const systemStats = {
      status: 'Operational',
      cpuLoad: `${Math.floor(Math.random() * 30 + 10)}%`, // Random between 10-40%
      memoryUsage: `${Math.floor(Math.random() * 30 + 30)}%`, // Random between 30-60%
      activeUsers: activeUsers,
      totalUsers: totalUsers,
      totalPortfolios: totalPortfolios,
      totalAUM: totalAUM,
      dbLatency: `${Math.floor(Math.random() * 20 + 10)}ms`, // Random between 10-30ms
      uptime: `${Math.floor(Math.random() * 100 + 99)}%`, // Random between 99-99%
    };

    res.status(200).json({
      success: true,
      data: systemStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full details of a specific user
 * @route   GET /api/admin/user/:id
 * @access  Private (Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get portfolio with positions
    const portfolio = await Portfolio.findOne({ user: user._id })
      .populate({
        path: 'positions.security',
        model: 'Security',
      });

    // Get transactions
    const transactions = await Transaction.find({ user: user._id })
      .sort({ date: -1 })
      .limit(100); // Limit to last 100 transactions

    // Format portfolio positions
    const formattedPositions = portfolio
      ? portfolio.positions.map(position => {
          const security = position.security;
          return {
            id: position._id,
            security: security ? {
              id: security._id,
              symbol: security.symbol,
              name: security.name,
              type: security.type,
              currentPrice: security.currentPrice,
            } : null,
            symbol: position.symbol,
            type: position.type,
            quantity: position.quantity,
            avgPrice: position.avgPrice,
          };
        })
      : [];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          joinedDate: user.joinedDate || user.createdAt,
        },
        portfolio: portfolio
          ? {
              balance: portfolio.balance,
              totalInvested: portfolio.totalInvested,
              positions: formattedPositions,
            }
          : null,
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          type: transaction.type,
          stockSymbol: transaction.stockSymbol,
          amount: transaction.amount,
          quantity: transaction.quantity,
          priceAtTransaction: transaction.priceAtTransaction,
          status: transaction.status,
          date: transaction.date,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getSystemStats,
  getUserById,
};


