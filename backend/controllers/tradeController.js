const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Security = require('../models/Security');

/**
 * @desc    Buy securities
 * @route   POST /api/trade/buy
 * @access  Private
 */
const buy = async (req, res, next) => {
  try {
    const { securityId, quantity } = req.body;

    // Validation
    if (!securityId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide securityId and a valid quantity greater than 0',
      });
    }

    // Find security
    const security = await Security.findById(securityId);
    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found',
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

    // Calculate total cost
    const pricePerUnit = security.currentPrice;
    const totalCost = pricePerUnit * quantity;

    // Check if user has sufficient balance
    if (portfolio.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ${totalCost}, Available: ${portfolio.balance}`,
      });
    }

    // Deduct balance
    portfolio.balance -= totalCost;

    // Find existing position or create new one
    const existingPositionIndex = portfolio.positions.findIndex(
      pos => pos.security.toString() === securityId.toString()
    );

    if (existingPositionIndex !== -1) {
      // Update existing position (calculate new average price)
      const existingPosition = portfolio.positions[existingPositionIndex];
      const existingCost = existingPosition.avgPrice * existingPosition.quantity;
      const newCost = totalCost;
      const totalQuantity = existingPosition.quantity + quantity;
      const newAvgPrice = (existingCost + newCost) / totalQuantity;

      portfolio.positions[existingPositionIndex].quantity = totalQuantity;
      portfolio.positions[existingPositionIndex].avgPrice = newAvgPrice;
    } else {
      // Create new position
      portfolio.positions.push({
        security: security._id,
        symbol: security.symbol,
        type: security.type,
        quantity: quantity,
        avgPrice: pricePerUnit,
      });
    }

    // Update total invested
    portfolio.totalInvested += totalCost;

    await portfolio.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'buy',
      stockSymbol: security.symbol,
      amount: totalCost,
      quantity: quantity,
      priceAtTransaction: pricePerUnit,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: {
        balance: portfolio.balance,
        security: security.symbol,
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        totalCost: totalCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sell securities
 * @route   POST /api/trade/sell
 * @access  Private
 */
const sell = async (req, res, next) => {
  try {
    const { securityId, quantity } = req.body;

    // Validation
    if (!securityId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide securityId and a valid quantity greater than 0',
      });
    }

    // Find security
    const security = await Security.findById(securityId);
    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found',
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

    // Find position
    const positionIndex = portfolio.positions.findIndex(
      pos => pos.security.toString() === securityId.toString()
    );

    if (positionIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You do not own this security',
      });
    }

    const position = portfolio.positions[positionIndex];

    // Check if user has sufficient quantity
    if (position.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Required: ${quantity}, Available: ${position.quantity}`,
      });
    }

    // Calculate proceeds
    const pricePerUnit = security.currentPrice;
    const totalProceeds = pricePerUnit * quantity;

    // Credit balance
    portfolio.balance += totalProceeds;

    // Update or remove position
    if (position.quantity === quantity) {
      // Remove position completely
      portfolio.positions.splice(positionIndex, 1);
    } else {
      // Reduce quantity
      portfolio.positions[positionIndex].quantity -= quantity;
    }

    // Update total invested (reduce by average cost of sold shares)
    const avgCost = position.avgPrice * quantity;
    portfolio.totalInvested -= avgCost;

    await portfolio.save();

    // Create transaction
    await Transaction.create({
      user: req.user._id,
      type: 'sell',
      stockSymbol: security.symbol,
      amount: totalProceeds,
      quantity: quantity,
      priceAtTransaction: pricePerUnit,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Sale successful',
      data: {
        balance: portfolio.balance,
        security: security.symbol,
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        totalProceeds: totalProceeds,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buy,
  sell,
};


