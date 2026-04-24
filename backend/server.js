const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedSecurities = require('./config/seedData');

// Load environment variables
dotenv.config();

// Connect to database and seed
connectDB().then((connected) => {
  // Seed database after connection is established
  if (connected) {
    setTimeout(() => {
      seedSecurities();
    }, 3000); // Wait 3 seconds for DB to fully connect
  }
});

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // HTTP request logger
// CORS - Allow all origins
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Route modules (loaded once, mounted at two prefixes each)
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const marketsRoutes = require('./routes/marketsRoutes');
const socialRoutes = require('./routes/socialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Mount routes at BOTH /api/... and /... prefixes (no logic duplication)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/portfolio', portfolioRoutes);
app.use('/portfolio', portfolioRoutes);

app.use('/api/trade', tradeRoutes);
app.use('/trade', tradeRoutes);

app.use('/api/markets', marketsRoutes);
app.use('/markets', marketsRoutes);

app.use('/api/social', socialRoutes);
app.use('/social', socialRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/alerts', alertRoutes);
app.use('/alerts', alertRoutes);

// Health check route (both prefixes)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TradeIn API is running',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TradeIn API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth  or  /auth',
      portfolio: '/api/portfolio  or  /portfolio',
      trade: '/api/trade  or  /trade',
      markets: '/api/markets  or  /markets',
      social: '/api/social  or  /social',
      admin: '/api/admin  or  /admin',
      alerts: '/api/alerts  or  /alerts',
      health: '/api/health  or  /health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 TradeIn API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URLs: http://0.0.0.0:${PORT}/api  and  http://0.0.0.0:${PORT}`);
  console.log(`💚 Health Check: http://0.0.0.0:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
