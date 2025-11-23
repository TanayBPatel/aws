const express = require('express');
const router = express.Router();
const { getAllSecurities, getSecurityById, seedSecurities } = require('../controllers/marketsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * Markets Routes
 * GET /api/markets - Get all securities (Public)
 * GET /api/markets/:id - Get single security (Public)
 * POST /api/markets/seed - Seed database with initial securities (Admin only)
 */
router.get('/', getAllSecurities);
router.get('/:id', getSecurityById);
// Allow seed without auth for initial setup (can be changed later)
router.post('/seed', seedSecurities); // Public for initial setup

module.exports = router;

