const SocialPost = require('../models/SocialPost');
const User = require('../models/User');

/**
 * @desc    Get all social posts
 * @route   GET /api/social
 * @access  Public
 */
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await SocialPost.find()
      .populate('user', 'name email avatar')
      .populate('likes', 'name')
      .populate('comments.user', 'name email avatar')
      .sort({ createdAt: -1 });

    const currentUserId = req.user?._id?.toString() || null;

    const formattedPosts = posts.map(post => ({
      id: post._id,
      user: {
        id: post.user._id,
        name: post.user.name,
        email: post.user.email,
        avatar: post.user.avatar || post.user.name.charAt(0),
        handle: `@${post.user.name.toLowerCase().replace(/\s+/g, '_')}`,
      },
      content: post.content,
      tags: post.tags,
      likes: post.likes.map(like => ({
        id: like._id,
        name: like.name,
      })),
      likesCount: post.likes.length,
      isLiked: currentUserId ? post.likes.some(like => like._id.toString() === currentUserId) : false,
      comments: post.comments.map(comment => ({
        id: comment._id,
        user: {
          id: comment.user._id,
          name: comment.user.name,
          avatar: comment.user.avatar || comment.user.name.charAt(0),
        },
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      commentsCount: post.comments.length,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt),
    }));

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      data: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get time ago
 */
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

/**
 * @desc    Create a new social post
 * @route   POST /api/social
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content cannot exceed 5000 characters',
      });
    }

    const post = await SocialPost.create({
      user: req.user._id,
      content: content.trim(),
      tags: tags || [],
      likes: [],
      comments: [],
    });

    await post.populate('user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: {
        id: post._id,
        user: {
          id: post.user._id,
          name: post.user.name,
          email: post.user.email,
          avatar: post.user.avatar || post.user.name.charAt(0),
          handle: `@${post.user.name.toLowerCase().replace(/\s+/g, '_')}`,
        },
        content: post.content,
        tags: post.tags,
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        createdAt: post.createdAt,
        timeAgo: 'Just now',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like on a post
 * @route   PUT /api/social/:id/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const post = await SocialPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id.toString();
    const likesArray = post.likes.map(id => id.toString());
    const isLiked = likesArray.includes(userId);

    if (isLiked) {
      // Unlike: remove user from likes
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like: add user to likes
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('user', 'name email avatar');
    await post.populate('likes', 'name');

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        id: post._id,
        likesCount: post.likes.length,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to a post
 * @route   POST /api/social/:id/comment
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const post = await SocialPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.comments.push({
      user: req.user._id,
      content: content.trim(),
    });

    await post.save();
    await post.populate('comments.user', 'name email avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: {
        id: newComment._id,
        user: {
          id: newComment.user._id,
          name: newComment.user.name,
          avatar: newComment.user.avatar || newComment.user.name.charAt(0),
        },
        content: newComment.content,
        createdAt: newComment.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Follow/Unfollow a user
 * @route   PUT /api/social/follow/:userId
 * @access  Private
 */
const toggleFollow = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      data: {
        isFollowing: !isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  toggleFollow,
};
