const Security = require('../models/Security');
const SocialPost = require('../models/SocialPost');
const User = require('../models/User');

/**
 * Seed database with initial securities and trending posts
 * This runs automatically on server start if database is empty
 */
const seedSecurities = async () => {
  try {
    // Check if securities already exist
    const existingCount = await Security.countDocuments();
    if (existingCount > 0) {
      console.log('✅ Securities already exist in database');
      // Still seed trending posts if they don't exist
      await seedTrendingPosts();
      return;
    }

    console.log('🌱 Seeding database with securities...');

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
      { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', currentPrice: 5600000, marketCap: '11T' }, // ~$67k USD = ~56L INR
      { symbol: 'ETH', name: 'Ethereum', type: 'crypto', currentPrice: 245005, marketCap: '3T' }, // ~$2.9k USD = ~2.45L INR
      { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', currentPrice: 28500, marketCap: '4.3L Cr' },
      { symbol: 'SOL', name: 'Solana', type: 'crypto', currentPrice: 14500, marketCap: '6.5L Cr' },
      { symbol: 'ADA', name: 'Cardano', type: 'crypto', currentPrice: 45, marketCap: '1.6L Cr' },
    ];

    const allSecurities = [...stocks, ...crypto];
    const createdSecurities = await Security.insertMany(allSecurities);

    console.log(`✅ Successfully seeded ${createdSecurities.length} securities:`);
    console.log(`   - ${stocks.length} stocks`);
    console.log(`   - ${crypto.length} cryptocurrencies`);
    
    // Seed trending posts
    await seedTrendingPosts();
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

/**
 * Seed trending posts based on stocks and crypto
 */
const seedTrendingPosts = async () => {
  try {
    const existingPosts = await SocialPost.countDocuments();
    if (existingPosts > 0) {
      console.log('✅ Trending posts already exist');
      return;
    }

    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('⚠️  No users found, skipping trending posts seed');
      return;
    }

    console.log('🌱 Seeding trending posts...');

    const trendingPosts = [
      {
        user: users[0]._id,
        content: 'Just bought ₹50,000 worth of RELIANCE at ₹1546. Bullish on their expansion plans! 🚀 #RELIANCE #IndianStocks #Trading',
        tags: ['RELIANCE', 'IndianStocks', 'Trading'],
        likes: users.slice(0, 2).map(u => u._id),
        comments: [
          {
            user: users[1]._id,
            content: 'Great move! Reliance has been showing strong fundamentals. 📈',
          },
        ],
      },
      {
        user: users[1]?._id || users[0]._id,
        content: 'Bitcoin hitting ₹56L is insane! Who else is holding BTC? 💎🙌 #BTC #Crypto #Bitcoin #HODL',
        tags: ['BTC', 'Crypto', 'Bitcoin', 'HODL'],
        likes: users.slice(0, 3).map(u => u._id),
        comments: [
          {
            user: users[0]._id,
            content: 'Holding strong! This is just the beginning 🚀',
          },
          {
            user: users[2]?._id || users[0]._id,
            content: 'Expecting ₹60L soon! 📊',
          },
        ],
      },
      {
        user: users[2]?._id || users[0]._id,
        content: 'TCS at ₹3150 looks like a solid buy for long term. IT sector showing resilience! 💼 #TCS #ITStocks #LongTerm',
        tags: ['TCS', 'ITStocks', 'LongTerm'],
        likes: users.slice(0, 2).map(u => u._id),
        comments: [
          {
            user: users[0]._id,
            content: 'Agreed! IT sector is undervalued right now.',
          },
        ],
      },
      {
        user: users[0]._id,
        content: 'Ethereum at ₹2.45L - perfect entry point for ETH! The merge is just the beginning 🎯 #ETH #Ethereum #Crypto',
        tags: ['ETH', 'Ethereum', 'Crypto'],
        likes: users.slice(0, 4).map(u => u._id),
        comments: [
          {
            user: users[1]?._id || users[0]._id,
            content: 'Ethereum has massive potential! 🔥',
          },
          {
            user: users[2]?._id || users[0]._id,
            content: 'Buying more on any dip!',
          },
        ],
      },
      {
        user: users[1]?._id || users[0]._id,
        content: 'HDFC Bank at ₹998 - banking sector recovery play! 🏦 #HDFCBANK #Banking #Stocks',
        tags: ['HDFCBANK', 'Banking', 'Stocks'],
        likes: users.slice(0, 3).map(u => u._id),
        comments: [
          {
            user: users[0]._id,
            content: 'Banking stocks are on the rise!',
          },
        ],
      },
      {
        user: users[0]._id,
        content: 'Solana breaking ₹14,500! Layer 1 competition heating up 🔥 #SOL #Solana #Crypto',
        tags: ['SOL', 'Solana', 'Crypto'],
        likes: users.slice(0, 2).map(u => u._id),
        comments: [],
      },
      {
        user: users[2]?._id || users[0]._id,
        content: 'Infosys quarterly results beat expectations! 📊 Adding more to my portfolio. #INFY #Infosys #IT',
        tags: ['INFY', 'Infosys', 'IT'],
        likes: users.slice(0, 3).map(u => u._id),
        comments: [
          {
            user: users[0]._id,
            content: 'Their cloud services division is growing strong!',
          },
        ],
      },
      {
        user: users[0]._id,
        content: 'BNB hitting ₹28,500 - Binance ecosystem growing! 🚀 #BNB #Binance #Crypto',
        tags: ['BNB', 'Binance', 'Crypto'],
        likes: users.slice(0, 2).map(u => u._id),
        comments: [],
      },
    ];

    await SocialPost.insertMany(trendingPosts);
    console.log(`✅ Successfully seeded ${trendingPosts.length} trending posts`);
  } catch (error) {
    console.error('❌ Error seeding trending posts:', error.message);
  }
};

module.exports = seedSecurities;

