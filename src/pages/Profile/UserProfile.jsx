import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profilesApi, postsApi } from '../../api';
import { authService } from '../../services/authService';
import PostCard from '../../components/PostCard/PostCard';
import { User, MapPin, Link as LinkIcon, Calendar, UserPlus, UserCheck, Star, Settings, ShieldAlert, Image, Lock, FileText, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/profile.css';

export default function UserProfile({ userId, onBackToFeed }) {
  const { user: currentUser } = useAuth();
  const targetId = userId || currentUser.id;
  const isOwnProfile = targetId === currentUser.id;

  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  // Content states
  const [userPosts, setUserPosts] = useState([]);
  const [userReels, setUserReels] = useState([]);
  const [userArticles, setUserArticles] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);

  // Relationship states
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [friendshipId, setFriendshipId] = useState(null);
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website_url: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  useEffect(() => {
    loadProfile();
  }, [targetId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile info
      const res = await profilesApi.getProfile(targetId);
      if (res.data) {
        setProfileData(res.data);
        setEditForm({
          name: res.data.user.name || '',
          bio: res.data.user.bio || '',
          location: res.data.user.location || '',
          website_url: res.data.user.website_url || ''
        });
      }

      // 2. Fetch Posts
      const postsRes = await postsApi.getPosts({ user_id: targetId });
      if (postsRes.data?.posts) {
        setUserPosts(postsRes.data.posts);
      }

      // 3. Fetch Reels
      const reelsRes = await postsApi.getReels();
      if (reelsRes.data?.reels) {
        const filteredReels = reelsRes.data.reels.filter(r => r.user?.id === targetId || r.user_id === targetId);
        setUserReels(filteredReels);
      }

      // 4. Fetch Articles
      const articlesRes = await postsApi.getArticles();
      if (articlesRes.data) {
        const filteredArticles = Array.isArray(articlesRes.data) 
          ? articlesRes.data.filter(a => a.user?.id === targetId || a.user_id === targetId)
          : [];
        setUserArticles(filteredArticles);
      }

      // 5. Fetch Bookmarks (only if own profile)
      if (isOwnProfile) {
        const bookmarksRes = await postsApi.getPosts();
        setUserBookmarks(bookmarksRes.data?.posts?.slice(0, 3) || []);
      }

      // 6. Fetch Highlights
      const highlightsRes = await profilesApi.getHighlights(targetId);
      if (highlightsRes.data) {
        setHighlights(highlightsRes.data);
      }

      // 7. Check Relationship status
      if (!isOwnProfile) {
        // Search profiles to get friendship status
        const searchRes = await profilesApi.searchProfiles({ q: res.data.user.name });
        const match = searchRes.data?.find(item => item.user.id === targetId);
        if (match) {
          setFriendshipStatus(match.friendship_status);
          setFriendshipId(match.friendship_id);
        }

        // Check close friend status
        const closeRes = await profilesApi.getCloseFriends(currentUser.id);
        const isClose = closeRes.data?.some(cf => cf.friend_id === targetId || cf.user_id === targetId);
        setIsCloseFriend(!!isClose);

        // Check following
        const followingRes = await profilesApi.getFollowingList();
        const following = followingRes.data?.some(f => f.id === targetId || f.followee_id === targetId);
        setIsFollowing(!!following);
      }

    } catch (err) {
      console.error('Error fetching profile details', err);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await profilesApi.unfollowUser(targetId);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await profilesApi.followUser(targetId);
        setIsFollowing(true);
        toast.success('Following successfully');
      }
    } catch (err) {
      toast.error('Error changing follow state');
    }
  };

  const handleFriendRequest = async () => {
    try {
      if (friendshipStatus === 'none') {
        const res = await profilesApi.sendFriendRequest(targetId);
        setFriendshipStatus('request_sent');
        setFriendshipId(res.data?.id);
        toast.success('Friend request sent');
      } else if (friendshipStatus === 'request_sent') {
        if (friendshipId) {
          await profilesApi.cancelFriendRequest(friendshipId);
          setFriendshipStatus('none');
          setFriendshipId(null);
          toast.success('Friend request cancelled');
        }
      } else if (friendshipStatus === 'request_received') {
        if (friendshipId) {
          await profilesApi.acceptFriendRequest(friendshipId);
          setFriendshipStatus('friends');
          toast.success('Friend request accepted');
        }
      }
    } catch (err) {
      toast.error('Error managing friendship request');
    }
  };

  const handleCloseFriendToggle = async () => {
    try {
      if (isCloseFriend) {
        await profilesApi.removeCloseFriend(currentUser.id, targetId);
        setIsCloseFriend(false);
        toast.success('Removed from Close Friends');
      } else {
        await profilesApi.addCloseFriend(currentUser.id, targetId);
        setIsCloseFriend(true);
        toast.success('Added to Close Friends');
      }
    } catch (err) {
      toast.error('Error modifying Close Friends');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await profilesApi.updateUser(targetId, editForm);
      if (res.data) {
        toast.success('Profile updated successfully');
        loadProfile();
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation
      });
      toast.success('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="premium-spinner"></div>
        <p>Decoding user records...</p>
      </div>
    );
  }

  const { user } = profileData || {};

  return (
    <div className="profile-container">
      {/* Cover Banner */}
      <div className="profile-cover-banner">
        <div className="profile-cover-overlay"></div>
        {user?.cover_photo ? (
          <img src={user.cover_photo} alt="Cover" className="profile-cover-img" />
        ) : (
          <div className="profile-cover-gradient"></div>
        )}
      </div>

      {/* Main Info Card */}
      <div className="profile-header-card glass">
        <div className="profile-header-main">
          {/* Avatar Area */}
          <div className="profile-avatar-container">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"} 
              alt="Avatar" 
              className="profile-avatar" 
            />
            {user?.online_status === 'online' && <span className="profile-online-badge"></span>}
          </div>

          {/* Details */}
          <div className="profile-basic-details">
            <div className="profile-name-row">
              <h2 className="profile-name">{user?.name}</h2>
              {user?.verified && <span className="profile-verified-badge">✓</span>}
            </div>
            <p className="profile-bio">{user?.bio || "No bio added yet."}</p>

            <div className="profile-metadata-row">
              {user?.location && (
                <span className="profile-meta-item">
                  <MapPin size={14} /> {user.location}
                </span>
              )}
              {user?.website_url && (
                <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="profile-meta-item link">
                  <LinkIcon size={14} /> Website
                </a>
              )}
              <span className="profile-meta-item">
                <Calendar size={14} /> Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions-panel">
            {isOwnProfile ? (
              <button onClick={() => setActiveTab('edit_profile')} className="glow-btn profile-action-btn">
                <Settings size={16} /> Edit Profile
              </button>
            ) : (
              <div className="profile-relationship-buttons">
                <button onClick={handleFollowToggle} className={`profile-action-btn ${isFollowing ? 'active' : ''}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button onClick={handleFriendRequest} className="profile-action-btn primary-glow">
                  {friendshipStatus === 'friends' && <><UserCheck size={16} /> Friends</>}
                  {friendshipStatus === 'request_sent' && 'Request Sent'}
                  {friendshipStatus === 'request_received' && 'Accept Request'}
                  {friendshipStatus === 'none' && <><UserPlus size={16} /> Add Friend</>}
                </button>
                <button onClick={handleCloseFriendToggle} className={`profile-action-btn icon-only ${isCloseFriend ? 'active' : ''}`} title="Close Friend">
                  <Star size={16} fill={isCloseFriend ? 'var(--accent-color)' : 'none'} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-item">
            <span className="profile-stat-number">{profileData?.friends_count || 0}</span>
            <span className="profile-stat-label">Friends</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-number">{profileData?.followers_count || 0}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-number">{profileData?.following_count || 0}</span>
            <span className="profile-stat-label">Following</span>
          </div>
          <div className="profile-stat-item">
            <span className="profile-stat-number">{userPosts.length}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      {highlights.length > 0 && (
        <div className="profile-highlights-section glass">
          <h4 className="highlights-title">Highlights</h4>
          <div className="highlights-tray">
            {highlights.map(hl => (
              <div key={hl.id} className="highlight-item-bubble">
                <div className="highlight-img-wrapper">
                  <img src={hl.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100&h=100"} alt="Highlight cover" />
                </div>
                <span>{hl.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Navigation Tabs */}
      <div className="profile-tabs-nav glass">
        <button className={`profile-tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          Posts
        </button>
        <button className={`profile-tab-btn ${activeTab === 'reels' ? 'active' : ''}`} onClick={() => setActiveTab('reels')}>
          Reels
        </button>
        <button className={`profile-tab-btn ${activeTab === 'articles' ? 'active' : ''}`} onClick={() => setActiveTab('articles')}>
          Articles
        </button>
        {isOwnProfile && (
          <>
            <button className={`profile-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
              Bookmarks
            </button>
            <button className={`profile-tab-btn ${activeTab === 'edit_profile' ? 'active' : ''}`} onClick={() => setActiveTab('edit_profile')}>
              Edit Profile
            </button>
            <button className={`profile-tab-btn ${activeTab === 'change_password' ? 'active' : ''}`} onClick={() => setActiveTab('change_password')}>
              Password
            </button>
          </>
        )}
      </div>

      {/* Tabs Content */}
      <div className="profile-tabs-content">
        
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="profile-posts-list">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <PostCard key={post.id} post={post} onDelete={(id) => setUserPosts(prev => prev.filter(p => p.id !== id))} />
              ))
            ) : (
              <div className="profile-empty-state">
                <User size={48} />
                <p>No posts published yet</p>
              </div>
            )}
          </div>
        )}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="profile-reels-grid">
            {userReels.length > 0 ? (
              userReels.map(reel => (
                <div key={reel.id} className="profile-reel-thumbnail glass">
                  <video src={reel.video_url} muted preload="metadata" />
                  <div className="profile-reel-overlay">
                    <span>❤️ {reel.likes_count}</span>
                    <span>💬 {reel.comments_count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="profile-empty-state">
                <FileText size={48} />
                <p>No reels captured yet</p>
              </div>
            )}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="profile-articles-list">
            {userArticles.length > 0 ? (
              userArticles.map(article => (
                <div key={article.id} className="profile-article-item glass">
                  <h3>{article.title}</h3>
                  <span className="article-date">{new Date(article.created_at).toLocaleDateString()}</span>
                  <p>{article.body?.slice(0, 150)}...</p>
                </div>
              ))
            ) : (
              <div className="profile-empty-state">
                <FileText size={48} />
                <p>No articles created yet</p>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div className="profile-posts-list">
            {userBookmarks.length > 0 ? (
              userBookmarks.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="profile-empty-state">
                <Bookmark size={48} />
                <p>No bookmarked posts</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit_profile' && isOwnProfile && (
          <form onSubmit={handleEditSubmit} className="profile-form-grid glass">
            <h3>Update Profile Information</h3>
            <div className="form-group">
              <label>Display Name</label>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea 
                value={editForm.bio} 
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} 
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                value={editForm.location} 
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Website URL</label>
              <input 
                type="url" 
                value={editForm.website_url} 
                onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })} 
              />
            </div>
            <button type="submit" className="glow-btn submit-btn">Save Changes</button>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'change_password' && isOwnProfile && (
          <form onSubmit={handlePasswordSubmit} className="profile-form-grid glass">
            <h3>Change Account Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={passwordForm.current_password} 
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={passwordForm.new_password} 
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.new_password_confirmation} 
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} 
                required 
              />
            </div>
            <button type="submit" className="glow-btn submit-btn">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
