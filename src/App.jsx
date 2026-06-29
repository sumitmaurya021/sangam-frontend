import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

import Header from './components/Header/Header';
import Feed from './components/Feed/Feed';
import Reels from './components/Reels/Reels';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

import UserProfile from './pages/Profile/UserProfile';
import Marketplace from './pages/Marketplace/Marketplace';
import Chat from './pages/Chat/Chat';
import Groups from './pages/Groups/Groups';
import Events from './pages/Events/Events';
import Fundraisers from './pages/Fundraisers/Fundraisers';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import Articles from './pages/Articles/Articles';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import AdminDashboard from './pages/Admin/AdminDashboard';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    notifications: 0
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        theme={theme} 
        toggleTheme={toggleTheme}
        unreadCounts={unreadCounts}
        setSelectedUserId={setSelectedUserId}
      />
      <main style={{ flex: 1 }}>
        {currentTab === 'feed' && <Feed setCurrentTab={setCurrentTab} setSelectedUserId={setSelectedUserId} />}
        {currentTab === 'reels' && <Reels />}
        {currentTab === 'chat' && <Chat />}
        {currentTab === 'notifications' && <NotificationsPage />}
        {currentTab === 'profile' && <UserProfile userId={selectedUserId} onBackToFeed={() => setCurrentTab('feed')} />}
        {currentTab === 'groups' && <Groups />}
        {currentTab === 'events' && <Events />}
        {currentTab === 'fundraisers' && <Fundraisers />}
        {currentTab === 'marketplace' && <Marketplace setCurrentTab={setCurrentTab} setSelectedUserId={setSelectedUserId} />}
        {currentTab === 'articles' && <Articles />}
        {currentTab === 'bookmarks' && <Bookmarks />}
        {currentTab === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-color)',
            },
            success: {
              iconTheme: {
                primary: 'var(--accent-color)',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
          
          {/* Catch all route for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
