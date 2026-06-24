import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Feed from './components/Feed/Feed';
import Reels from './components/Reels/Reels';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [theme, setTheme] = useState('dark');
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 3,
    notifications: 5
  });

  useEffect(() => {
    // Set theme attribute on documentElement
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        theme={theme} 
        toggleTheme={toggleTheme}
        unreadCounts={unreadCounts}
      />

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {currentTab === 'feed' && <Feed />}
        {currentTab === 'reels' && <Reels />}
        {currentTab === 'chat' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
            <h3>Chat Panel (Integrates ActionCable / Conversations API)</h3>
          </div>
        )}
        {currentTab === 'notifications' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
            <h3>Notifications Board</h3>
          </div>
        )}
        {currentTab === 'profile' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
            <h3>Profile highlights & user detail pages</h3>
          </div>
        )}
      </main>
    </div>
  );
}
