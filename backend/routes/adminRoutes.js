const express = require('express');
const router = express.Router();
const { getAllUsers, getSystemStats, getUserById } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * Admin Routes
 * All routes require authentication and admin role
 * GET /api/admin/users - Get all users
 * GET /api/admin/system - Get system statistics
 * GET /api/admin/user/:id - Get full details of a specific user
 */
router.use(auth); // All routes require authentication
router.use(admin); // All routes require admin role

router.get('/users', getAllUsers);
router.get('/system', getSystemStats);
router.get('/user/:id', getUserById);

module.exports = router;


