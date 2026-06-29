import React, { useState, useEffect } from 'react';
import { miscApi } from '../../api';
import { Bell, Check, Trash2, Heart, MessageSquare, UserPlus, Star, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await miscApi.getNotifications();
      if (res.data) setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await miscApi.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Error updating notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await miscApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Error updating notifications');
    }
  };

  const handleDelete = async (id) => {
    try {
      await miscApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
      case 'reel_like':
        return <Heart size={16} color="var(--like-color)" fill="var(--like-color)" />;
      case 'comment':
      case 'reel_comment':
        return <MessageSquare size={16} color="var(--accent-color)" />;
      case 'friend_request':
      case 'friend_accept':
        return <UserPlus size={16} color="#10b981" />;
      case 'close_friend_add':
        return <Star size={16} color="var(--bookmark-color)" fill="var(--bookmark-color)" />;
      default:
        return <Bell size={16} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="notifications-page-container">
      <div className="notifications-header-row">
        <div>
          <h1>Notifications</h1>
          <p>Activity timeline logged across the network core.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button onClick={handleMarkAllRead} className="glow-btn mark-all-btn">
            <Check size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="notifications-layout glass">
        {loading ? (
          <div className="notifications-loader">
            <div className="premium-spinner"></div>
            <p>Decoding inbox packets...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                <div className="notification-icon-wrapper">
                  {getIcon(n.notifiable_type || n.activity_type)}
                </div>

                <div className="notification-content">
                  <p className="notification-message">{n.message || 'New activity logged.'}</p>
                  <span className="notification-time">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="notification-actions">
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="action-btn read-btn" title="Mark as read">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="action-btn delete-btn" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <Bell size={48} />
            <p>No new transmissions recorded in this epoch.</p>
          </div>
        )}
      </div>
    </div>
  );
}
