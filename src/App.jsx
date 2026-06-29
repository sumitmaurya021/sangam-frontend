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

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [theme, setTheme] = useState('dark');
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 3,
    notifications: 5
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
      />
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
