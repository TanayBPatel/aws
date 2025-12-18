import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Edit, X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Social: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trending' | 'following'>('trending');
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchFollowing();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsData = await api.getSocialPosts();
      setPosts(postsData || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      // Get current user's following list from API or localStorage
      const currentUser = api.getCurrentUser();
      if (currentUser && currentUser.following) {
        setFollowing(currentUser.following);
      } else {
        // Load from localStorage as fallback
        const saved = localStorage.getItem('following');
        if (saved) {
          setFollowing(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('Failed to fetch following:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.toggleLike(postId);
      // Refresh posts to get updated like status
      fetchPosts();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await api.toggleFollow(userId);
      // Update following list
      const newFollowing = following.includes(userId)
        ? following.filter(id => id !== userId)
        : [...following, userId];
      setFollowing(newFollowing);
      localStorage.setItem('following', JSON.stringify(newFollowing));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      // Extract tags from content (words starting with #)
      const tags = newPostContent.match(/#\w+/g)?.map(tag => tag.substring(1)) || [];

      const result = await api.createPost(newPostContent, tags);
      if (result.success) {
        setNewPostContent('');
        setIsCreateModalOpen(false);
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = commentInputs[postId];
    if (!commentContent || !commentContent.trim()) return;

    try {
      await api.addComment(postId, commentContent);
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts(); // Refresh to show new comment
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const displayedPosts = activeTab === 'trending'
    ? posts
    : posts.filter(p => following.includes(p.user.id) || p.user.id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark pb-24 font-sans px-2 transition-colors duration-300 relative">
      {/* Header */}
      <header className="pt-2 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-textPrimary">Community</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight transition-colors text-textPrimary"
        >
          <Edit size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-borderBase px-2">
        <button
          onClick={() => setActiveTab('trending')}
          className={`pb-3 text-lg font-medium transition-all ${activeTab === 'trending'
              ? 'text-textPrimary border-b-2 border-accentLime'
              : 'text-textSecondary hover:text-textPrimary'
            }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`pb-3 text-lg font-medium transition-all ${activeTab === 'following'
              ? 'text-textPrimary border-b-2 border-accentLime'
              : 'text-textSecondary hover:text-textPrimary'
            }`}
        >
          Following
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => {
            const isFollowingUser = following.includes(post.user.id);
            const isCurrentUser = post.user.id === user?.id;
            const showComments = expandedComments.has(post.id);

            return (
              <div key={post.id} className="bg-cardDark p-5 rounded-2xl border border-borderBase shadow-sm">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-surfaceLighter flex items-center justify-center text-textPrimary font-bold border border-borderBase">
                    {post.user.avatar || post.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-textPrimary font-medium leading-tight">{post.user.name}</h4>
                    <p className="text-xs text-textSecondary">{post.user.handle || `@${post.user.name.toLowerCase().replace(/\s+/g, '_')}`} • {post.timeAgo || 'Just now'}</p>
                  </div>
                  {!isCurrentUser && (
                    <button
                      onClick={() => handleFollow(post.user.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${isFollowingUser
                          ? 'text-primary bg-primary/10 hover:bg-primary/20'
                          : 'text-primary bg-primary/10 hover:bg-primary/20'
                        }`}
                    >
                      {isFollowingUser ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-textPrimary text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-medium text-accentPurple bg-accentPurple/10 px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comments Section */}
                {showComments && post.comments && post.comments.length > 0 && (
                  <div className="mb-4 space-y-3 p-3 bg-surfaceLight/30 rounded-xl border border-borderBase">
                    {post.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-surfaceLighter flex items-center justify-center text-xs font-bold text-textPrimary">
                          {comment.user.avatar || comment.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-textPrimary">{comment.user.name}</p>
                          <p className="text-sm text-textSecondary mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {showComments && (
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                      placeholder="Add a comment..."
                      className="flex-1 bg-surfaceLight border border-borderBase rounded-xl px-3 py-2 text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-borderBase">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? 'text-error' : 'text-textSecondary hover:text-textPrimary'
                      }`}
                  >
                    <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                    <span>{post.likesCount || post.likes?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount || post.comments?.length || 0}</span>
                    {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <button className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition-colors">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-textSecondary">
            {activeTab === 'following'
              ? "You aren't following anyone yet. Switch to Trending to find traders!"
              : "No posts found."}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-transform md:hidden z-40"
      >
        <Edit size={24} />
      </button>

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-cardDark w-full max-w-md rounded-3xl border border-borderBase p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-textPrimary">New Note</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary hover:bg-surfaceLighter"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your investment ideas... Use #tags for stocks/crypto (e.g., #BTC, #RELIANCE)"
              className="w-full h-32 bg-surfaceLight rounded-xl p-4 text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-1 focus:ring-primary mb-4 resize-none"
              maxLength={5005}
            ></textarea>

            <div className="flex justify-between items-center">
              <span className="text-xs text-textSecondary">{newPostContent.length}/5005</span>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="px-6 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
