import React, { useState, useEffect, useRef } from 'react';
import { Home, Film, MessageSquare, Bell, Search, Sun, Moon, Sparkles, User, LogOut, Settings, Shield, Loader2, Heart, Trash2, UserPlus, Star, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profilesApi, miscApi } from '../../api';
import toast from 'react-hot-toast';
import '../../assets/css/Header.css';

export default function Header({ currentTab, setCurrentTab, theme, toggleTheme, unreadCounts = {}, setSelectedUserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Notifications Dropdown State
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const notificationsContainerRef = useRef(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout, user } = useAuth();

  // Debounced Search API Call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowSearchResults(true);
        try {
          const res = await profilesApi.searchProfiles({ q: searchQuery });
          setSearchResults(res.data?.data || []);
        } catch (err) {
          console.error("Search failed:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch notifications dropdown
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await miscApi.getNotificationsDropdown();
      const fetchedNotifications = res.data?.data?.notifications || res.data?.notifications;
      if (Array.isArray(fetchedNotifications)) {
        setNotifications(fetchedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch dropdown notifications", err);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (showNotificationsMenu) {
      fetchNotifications();
    }
  }, [showNotificationsMenu]);

  // Click Outside Listener for both Search and Notifications dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (userId) => {
    setSelectedUserId(userId);
    setCurrentTab('profile');
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await miscApi.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await miscApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await miscApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleAcceptFriend = async (e, friendshipId, notificationId) => {
    e.stopPropagation();
    try {
      await profilesApi.acceptFriendRequest(friendshipId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, friendship_accepted: true } : n)
      );
      toast.success('Friend request accepted');
    } catch (err) {
      console.error("Failed to accept friend request", err);
    }
  };

  const handleRejectFriend = async (e, friendshipId, notificationId) => {
    e.stopPropagation();
    try {
      await profilesApi.rejectFriendRequest(friendshipId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Friend request rejected');
    } catch (err) {
      console.error("Failed to reject friend request", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
      case 'reel_like':
        return <Heart size={14} color="var(--like-color)" fill="var(--like-color)" />;
      case 'comment':
      case 'reel_comment':
        return <MessageSquare size={14} color="var(--accent-color)" />;
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus size={14} color="#10b981" />;
      case 'close_friend_add':
        return <Star size={14} color="var(--bookmark-color)" fill="var(--bookmark-color)" />;
      default:
        return <Bell size={14} color="var(--text-muted)" />;
    }
  };

  return (
    <header className="glass header-container">
      {/* Brand Logo */}
      <div 
        onClick={() => setCurrentTab('feed')} 
        className="header-logo-container"
      >
        <span className="header-logo-text">
          Sangam
        </span>
        <div className="header-logo-tag">
          <Sparkles size={10} color="var(--accent-color)" />
          <span>PREMIUM</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="header-search-container" ref={searchContainerRef}>
        <Search size={18} color="var(--text-muted)" className="header-search-icon" />
        <input
          type="text"
          placeholder="Search creators, trends, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) setShowSearchResults(true);
          }}
          className="header-search-input"
        />

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="header-search-results-dropdown">
            {isSearching ? (
              <div className="search-result-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={16} className="spinner" /> AI is searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div 
                  key={result.user.id} 
                  className="header-search-result-item"
                  onClick={() => handleResultClick(result.user.id)}
                >
                  <img src={result.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'} alt={result.user.name} className="search-result-avatar" />
                  <div className="search-result-info">
                    <span className="search-result-name">{result.user.name}</span>
                    <span className="search-result-email">{result.user.email}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-result-empty">
                No matches found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation & Controls */}
      <div className="header-actions-container">
        {/* Navigation Tabs */}
        <nav className="header-nav">
          {/* Feed/Home Tab */}
          <button 
            onClick={() => setCurrentTab('feed')}
            className={`animated-icon header-nav-btn ${currentTab === 'feed' ? 'active' : 'inactive'}`}
          >
            <Home size={22} style={{ filter: currentTab === 'feed' ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))' : 'none' }} />
            {currentTab === 'feed' && <span className="header-nav-indicator" />}
          </button>

          {/* Reels Tab */}
          <button 
            onClick={() => setCurrentTab('reels')}
            className={`animated-icon header-nav-btn ${currentTab === 'reels' ? 'active' : 'inactive'}`}
          >
            <Film size={22} style={{ filter: currentTab === 'reels' ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))' : 'none' }} />
            {currentTab === 'reels' && <span className="header-nav-indicator" />}
          </button>

          {/* Chat Tab */}
          <button 
            onClick={() => setCurrentTab('chat')}
            className={`animated-icon header-nav-btn ${currentTab === 'chat' ? 'active' : 'inactive'}`}
          >
            <MessageSquare size={22} />
            {unreadCounts.messages > 0 && (
              <span className="header-badge">
                {unreadCounts.messages}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="header-notifications-container" ref={notificationsContainerRef}>
            <button 
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className={`animated-icon header-nav-btn ${showNotificationsMenu ? 'active' : 'inactive'}`}
            >
              <Bell size={22} style={{ filter: showNotificationsMenu ? 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))' : 'none' }} />
              {unreadCounts.notifications > 0 && (
                <span className="header-badge">
                  {unreadCounts.notifications}
                </span>
              )}
            </button>

            {showNotificationsMenu && (
              <div className="glass header-notifications-dropdown">
                <div className="notifications-dropdown-header">
                  <h4>Notifications</h4>
                  {notifications.some(n => !n.read) && (
                    <button onClick={handleMarkAllRead} className="notifications-dropdown-markall">
                      Mark all read
                    </button>
                  )}
                </div>

                {isLoadingNotifications ? (
                  <div className="notifications-dropdown-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="spinner" />
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>AI is fetching...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="notifications-dropdown-list">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`notifications-dropdown-item ${n.read ? 'read' : 'unread'}`}
                      >
                        <div 
                          className="notifications-dropdown-item-icon"
                          onClick={() => {
                            if (n.actor_id) {
                              setSelectedUserId(n.actor_id);
                              setCurrentTab('profile');
                              setShowNotificationsMenu(false);
                            }
                          }}
                        >
                          {getNotificationIcon(n.notification_type || n.notifiable_type)}
                        </div>

                        <div 
                          className="notifications-dropdown-item-content"
                          onClick={() => {
                            if (n.actor_id) {
                              setSelectedUserId(n.actor_id);
                              setCurrentTab('profile');
                              setShowNotificationsMenu(false);
                            }
                          }}
                        >
                          <p className="notifications-dropdown-item-msg">{n.message || 'New activity logged.'}</p>
                          <span className="notifications-dropdown-item-time">{new Date(n.created_at).toLocaleDateString()}</span>
                          
                          {n.notification_type === 'friend_request' && (
                            <div className="friend-request-actions" style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              {n.friendship_accepted ? (
                                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={12} /> Accepted
                                </span>
                              ) : (
                                <>
                                  <button 
                                    onClick={(e) => handleAcceptFriend(e, n.friendship_id, n.id)} 
                                    className="glow-btn accept-btn"
                                    style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer' }}
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={(e) => handleRejectFriend(e, n.friendship_id, n.id)} 
                                    className="action-btn reject-btn"
                                    style={{ padding: '2px 8px', fontSize: '0.75rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="notifications-dropdown-item-actions">
                          {!n.read && (
                            <button 
                              onClick={(e) => handleMarkRead(e, n.id)} 
                              className="notifications-dropdown-action-btn"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => handleDeleteNotification(e, n.id)} 
                            className="notifications-dropdown-action-btn delete"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notifications-dropdown-empty">
                    <Bell size={24} />
                    <p>All caught up!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Vertical divider */}
        <div className="header-divider" />

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="animated-icon header-theme-btn"
        >
          {theme === 'dark' ? <Sun size={18} color="#eab308" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Profile Dropdown Container */}
        <div className="header-profile-container">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="header-profile-btn"
          >
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"} 
              alt="User Avatar"
              className="header-profile-avatar"
            />
          </button>

          {showProfileMenu && (
            <div className="glass header-dropdown-menu">
              <div className="header-dropdown-userinfo">
                <p className="header-dropdown-name">{user?.name || 'User'}</p>
                <p className="header-dropdown-username">{user?.email || '@user'}</p>
              </div>
              <button className="header-dropdown-item" onClick={() => { setSelectedUserId(user?.id); setCurrentTab('profile'); setShowProfileMenu(false); }}>
                <User size={16} /> Profile
              </button>
              {user?.super_admin && (
                <button className="header-dropdown-item" onClick={() => { setCurrentTab('admin'); setShowProfileMenu(false); }}>
                  <Shield size={16} color="var(--accent-color)" /> Admin Panel
                </button>
              )}
              <hr className="header-dropdown-divider" />
              <button className="header-dropdown-item logout" onClick={logout}>
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
