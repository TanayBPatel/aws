const Security = require('../models/Security');

/**
 * @desc    Get all securities
 * @route   GET /api/markets
 * @access  Public
 */
const getAllSecurities = async (req, res, next) => {
  try {
    const securities = await Security.find().sort({ symbol: 1 });

    const formattedSecurities = securities.map(security => ({
      id: security._id,
      symbol: security.symbol,
      name: security.name,
      type: security.type,
      price: security.currentPrice,
      marketCap: security.marketCap,
      change: 0, // Can be calculated from priceHistory if needed
      changePercent: 0, // Can be calculated from priceHistory if needed
    }));

    res.status(200).json({
      success: true,
      count: formattedSecurities.length,
      data: formattedSecurities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single security details
 * @route   GET /api/markets/:id
 * @access  Public
 */
const getSecurityById = async (req, res, next) => {
  try {
    const security = await Security.findById(req.params.id);

    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: security._id,
        symbol: security.symbol,
        name: security.name,
        type: security.type,
        currentPrice: security.currentPrice,
        marketCap: security.marketCap,
        priceHistory: security.priceHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed database with initial securities (Admin only)
 * @route   POST /api/markets/seed
 * @access  Private (Admin)
 */
const seedSecurities = async (req, res, next) => {
  try {
    // Check if securities already exist
    const existingCount = await Security.countDocuments();
    
    // Stock data from user's list
    const stocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'stock', currentPrice: 1546.60, marketCap: '20.93L Cr' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'stock', currentPrice: 998.05, marketCap: '15.35L Cr' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', type: 'stock', currentPrice: 2162.70, marketCap: '12.97L Cr' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', type: 'stock', currentPrice: 3150.60, marketCap: '11.40L Cr' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', type: 'stock', currentPrice: 1369.50, marketCap: '9.79L Cr' },
      { symbol: 'SBIN', name: 'State Bank of India', type: 'stock', currentPrice: 972.60, marketCap: '8.98L Cr' },
      { symbol: 'INFY', name: 'Infosys', type: 'stock', currentPrice: 1545.00, marketCap: '6.42L Cr' },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance', type: 'stock', currentPrice: 1004.10, marketCap: '6.25L Cr' },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', type: 'stock', currentPrice: 2433.70, marketCap: '5.72L Cr' },
      { symbol: 'LICI', name: 'Life Insurance Corp', type: 'stock', currentPrice: 902.40, marketCap: '5.71L Cr' },
      { symbol: 'LT', name: 'Larsen & Toubro', type: 'stock', currentPrice: 4024.90, marketCap: '5.54L Cr' },
      { symbol: 'ITC', name: 'ITC Limited', type: 'stock', currentPrice: 407.85, marketCap: '5.11L Cr' },
      { symbol: 'MARUTI', name: 'Maruti Suzuki', type: 'stock', currentPrice: 15977.00, marketCap: '5.02L Cr' },
      { symbol: 'M&M', name: 'Mahindra & Mahindra', type: 'stock', currentPrice: 3749.60, marketCap: '4.66L Cr' },
      { symbol: 'HCLTECH', name: 'HCL Technologies', type: 'stock', currentPrice: 1608.00, marketCap: '4.36L Cr' },
    ];

    // Top 5 Crypto coins
    const crypto = [
      { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', currentPrice: 5600000, marketCap: '11T' },
      { symbol: 'ETH', name: 'Ethereum', type: 'crypto', currentPrice: 245005, marketCap: '3T' },
      { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', currentPrice: 28500, marketCap: '4.3L Cr' },
      { symbol: 'SOL', name: 'Solana', type: 'crypto', currentPrice: 14500, marketCap: '6.5L Cr' },
      { symbol: 'ADA', name: 'Cardano', type: 'crypto', currentPrice: 45, marketCap: '1.6L Cr' },
    ];

    const allSecurities = [...stocks, ...crypto];
    
    // If securities exist, clear and reseed (for admin manual reseed)
    if (existingCount > 0) {
      await Security.deleteMany({});
    }
    
    const createdSecurities = await Security.insertMany(allSecurities);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${createdSecurities.length} securities`,
      count: createdSecurities.length,
      data: createdSecurities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSecurities,
  getSecurityById,
  seedSecurities,
};
