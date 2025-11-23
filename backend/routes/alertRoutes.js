const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, deleteAlert } = require('../controllers/alertController');
const auth = require('../middleware/auth');

/**
 * Alert Routes
 * All routes require authentication
 * GET /api/alerts - Get all alerts for user
 * POST /api/alerts - Create a new alert
 * DELETE /api/alerts/:id - Delete an alert
 */
router.use(auth); // Protect all routes

router.get('/', getAlerts);
router.post('/', createAlert);
router.delete('/:id', deleteAlert);

module.exports = router;


