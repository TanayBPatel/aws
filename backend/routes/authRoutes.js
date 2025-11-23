const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

/**
 * Auth Routes
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login - Login user
 */
router.post('/register', register);
router.post('/login', login);

module.exports = router;


