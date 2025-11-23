const express = require('express');
const router = express.Router();
const { buy, sell } = require('../controllers/tradeController');
const auth = require('../middleware/auth');

/**
 * Trade Routes
 * All routes require authentication
 * POST /api/trade/buy - Buy securities
 * POST /api/trade/sell - Sell securities
 */
router.use(auth); // Protect all routes

router.post('/buy', buy);
router.post('/sell', sell);

module.exports = router;


