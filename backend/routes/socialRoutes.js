const express = require('express');
const router = express.Router();
const { getAllPosts, createPost, toggleLike, addComment, toggleFollow } = require('../controllers/socialController');
const auth = require('../middleware/auth');

/**
 * Social Routes
 * GET /api/social - Get all posts (Public, but can use auth for follow status)
 * POST /api/social - Create a new post (Private)
 * PUT /api/social/:id/like - Toggle like on a post (Private)
 * POST /api/social/:id/comment - Add comment to a post (Private)
 * PUT /api/social/follow/:userId - Follow/Unfollow a user (Private)
 */
// Optional auth for getting posts (works with or without auth)
router.get('/', async (req, res, next) => {
  // Try optional auth
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      const User = require('../models/User');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Auth failed, continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  return getAllPosts(req, res, next);
});
router.post('/', auth, createPost); // Requires authentication
router.put('/:id/like', auth, toggleLike); // Requires authentication
router.post('/:id/comment', auth, addComment); // Requires authentication
router.put('/follow/:userId', auth, toggleFollow); // Requires authentication

module.exports = router;

