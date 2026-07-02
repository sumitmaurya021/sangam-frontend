import React, { useState, useEffect } from 'react';
import { miscApi, profilesApi } from '../../api';
import { Bell, Check, Trash2, Heart, MessageSquare, UserPlus, Star, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/NotificationsPage.css';

export default function NotificationsPage({ setCurrentTab, setSelectedUserId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await miscApi.getNotifications();
      const fetchedNotifications = res.data?.data || res.data;
      if (Array.isArray(fetchedNotifications)) {
        setNotifications(fetchedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await miscApi.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Error updating notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await miscApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
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

  const handleAcceptFriend = async (friendshipId, notificationId) => {
    try {
      await profilesApi.acceptFriendRequest(friendshipId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, friendship_accepted: true } : n)
      );
      toast.success('Friend request accepted');
    } catch (err) {
      toast.error('Failed to accept friend request');
    }
  };

  const handleRejectFriend = async (friendshipId, notificationId) => {
    try {
      await profilesApi.rejectFriendRequest(friendshipId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Friend request rejected');
    } catch (err) {
      toast.error('Failed to reject friend request');
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
              <div 
                key={n.id} 
                className={`notification-item ${n.read ? 'read' : 'unread'}`}
              >
                <div 
                  className="notification-icon-wrapper"
                  onClick={() => {
                    if (n.actor_id) {
                      setSelectedUserId(n.actor_id);
                      setCurrentTab('profile');
                    }
                  }}
                  style={{ cursor: n.actor_id ? 'pointer' : 'default' }}
                >
                  {getIcon(n.notification_type || n.notifiable_type || n.activity_type)}
                </div>

                <div 
                  className="notification-content"
                  onClick={() => {
                    if (n.actor_id) {
                      setSelectedUserId(n.actor_id);
                      setCurrentTab('profile');
                    }
                  }}
                  style={{ cursor: n.actor_id ? 'pointer' : 'default' }}
                >
                  <p className="notification-message">{n.message || 'New activity logged.'}</p>
                  <span className="notification-time">
                    {new Date(n.created_at).toLocaleString()}
                  </span>

                  {n.notification_type === 'friend_request' && (
                    <div className="friend-request-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {n.friendship_accepted ? (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Request Accepted
                        </span>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAcceptFriend(n.friendship_id, n.id); }} 
                            className="glow-btn accept-btn"
                            style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRejectFriend(n.friendship_id, n.id); }} 
                            className="action-btn reject-btn"
                            style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
