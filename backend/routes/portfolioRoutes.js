const express = require('express');
const router = express.Router();
const { getPortfolio, deposit, withdraw, getTransactions } = require('../controllers/portfolioController');
const auth = require('../middleware/auth');

/**
 * Portfolio Routes
 * All routes require authentication
 * GET /api/portfolio - Get user's portfolio
 * GET /api/portfolio/transactions - Get transaction history
 * POST /api/portfolio/deposit - Deposit funds
 * POST /api/portfolio/withdraw - Withdraw funds
 */
router.use(auth); // Protect all routes

router.get('/', getPortfolio);
router.get('/transactions', getTransactions);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

module.exports = router;

