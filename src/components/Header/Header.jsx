import React, { useState } from 'react';
import { Home, Film, MessageSquare, Bell, Search, Sun, Moon, Sparkles, User, LogOut, Settings } from 'lucide-react';
import '../../assets/css/Header.css';

export default function Header({ currentTab, setCurrentTab, theme, toggleTheme, unreadCounts = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      <div className="header-search-container">
        <Search size={18} color="var(--text-muted)" className="header-search-icon" />
        <input
          type="text"
          placeholder="Search creators, trends, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="header-search-input"
        />
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

          {/* Notifications Tab */}
          <button 
            onClick={() => setCurrentTab('notifications')}
            className={`animated-icon header-nav-btn ${currentTab === 'notifications' ? 'active' : 'inactive'}`}
          >
            <Bell size={22} />
            {unreadCounts.notifications > 0 && (
              <span className="header-badge">
                {unreadCounts.notifications}
              </span>
            )}
          </button>
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
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" 
              alt="User Avatar"
              className="header-profile-avatar"
            />
          </button>

          {showProfileMenu && (
            <div className="glass header-dropdown-menu">
              <div className="header-dropdown-userinfo">
                <p className="header-dropdown-name">Ananya Sharma</p>
                <p className="header-dropdown-username">@ananya_sharma</p>
              </div>
              <button className="header-dropdown-item" onClick={() => { setCurrentTab('profile'); setShowProfileMenu(false); }}>
                <User size={16} /> Profile
              </button>
              <button className="header-dropdown-item">
                <Settings size={16} /> Settings
              </button>
              <hr className="header-dropdown-divider" />
              <button className="header-dropdown-item logout">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
