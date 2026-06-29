import React, { useState, useEffect } from 'react';
import { miscApi } from '../../api';
import { Shield, Users, FileText, Heart, MessageSquare, Award, TrendingUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'users' | 'posts'

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const resStats = await miscApi.adminGetStats();
      if (resStats.data) setStats(resStats.data);

      const resUsers = await miscApi.adminGetUsers();
      if (resUsers.data) setUsersList(resUsers.data);

      const resPosts = await miscApi.adminGetPosts();
      if (resPosts.data) setPostsList(resPosts.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
      toast.error('Forbidden: Super Admin privileges required');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetail = async (id) => {
    try {
      const res = await miscApi.adminGetUserDetails(id);
      if (res.data) setSelectedUser(res.data);
    } catch (err) {
      toast.error('Failed to load user details');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="premium-spinner"></div>
        <p>Connecting to secure core nodes...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-empty">
        <Shield size={48} color="#ef4444" />
        <h3>Access Denied</h3>
        <p>Your credentials do not match the required authorization parameters.</p>
      </div>
    );
  }

  const overall = stats.overall_statistics || {};

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header-row">
        <div>
          <h1>Admin Control Room</h1>
          <p>System configurations and real-time ledger metrics.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-row">
        <div className="glass metric-box">
          <Users size={20} color="var(--accent-color)" />
          <div>
            <span>Total Users</span>
            <h3>{overall.total_users || 0}</h3>
          </div>
        </div>
        <div className="glass metric-box">
          <FileText size={20} color="#10b981" />
          <div>
            <span>Total Posts</span>
            <h3>{overall.total_posts || 0}</h3>
          </div>
        </div>
        <div className="glass metric-box">
          <Heart size={20} color="#ef4444" />
          <div>
            <span>Total Likes</span>
            <h3>{overall.total_likes || 0}</h3>
          </div>
        </div>
        <div className="glass metric-box">
          <MessageSquare size={20} color="#3b82f6" />
          <div>
            <span>Total Comments</span>
            <h3>{overall.total_comments || 0}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="admin-tabs-nav glass">
        <button className={activeSubTab === 'overview' ? 'active' : ''} onClick={() => setActiveSubTab('overview')}>
          Metrics Overview
        </button>
        <button className={activeSubTab === 'users' ? 'active' : ''} onClick={() => setActiveSubTab('users')}>
          User Records
        </button>
        <button className={activeSubTab === 'posts' ? 'active' : ''} onClick={() => setActiveSubTab('posts')}>
          Post Records
        </button>
      </div>

      {/* Tab Panels */}
      <div className="admin-tab-content">
        
        {activeSubTab === 'overview' && (
          <div className="overview-panel">
            {/* Top Posters & Likers Grid */}
            <div className="top-users-grid">
              
              {/* Top Posters */}
              <div className="glass leaderboard-card">
                <h4>Top Creators (Post count)</h4>
                <div className="leaderboard-list">
                  {stats.top_users?.top_posters?.map((u, i) => (
                    <div key={u.id} className="leaderboard-item">
                      <span>#{i+1} {u.name}</span>
                      <span className="count-badge">{u.count} posts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Likers */}
              <div className="glass leaderboard-card">
                <h4>Top Interactors (Likes count)</h4>
                <div className="leaderboard-list">
                  {stats.top_users?.top_likers?.map((u, i) => (
                    <div key={u.id} className="leaderboard-item">
                      <span>#{i+1} {u.name}</span>
                      <span className="count-badge pink">{u.count} likes</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Growth Stat details */}
            <div className="glass growth-card">
              <div className="card-header">
                <TrendingUp size={18} color="var(--accent-color)" />
                <h4>Last 30 Days Growth</h4>
              </div>
              <div className="growth-metrics">
                <div>
                  <span>New Signups</span>
                  <h3>+{stats.growth_statistics?.users_last_30_days || 0}</h3>
                </div>
                <div>
                  <span>New Publications</span>
                  <h3>+{stats.growth_statistics?.posts_last_30_days || 0}</h3>
                </div>
                <div>
                  <span>New Interactions</span>
                  <h3>+{stats.growth_statistics?.likes_last_30_days || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users list tab */}
        {activeSubTab === 'users' && (
          <div className="glass table-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.verified ? 'Yes' : 'No'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleViewUserDetail(u.id)} className="details-btn">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Posts list tab */}
        {activeSubTab === 'posts' && (
          <div className="glass table-panel">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Author</th>
                  <th>Visibility</th>
                  <th>Created At</th>
                  <th>Content Preview</th>
                </tr>
              </thead>
              <tbody>
                {postsList.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.user?.name || 'Unknown'}</td>
                    <td className="capitalize">{p.visibility}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="preview-td">{p.content || 'Media link'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* User Details Inspect Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Inspect User Node</h3>
              <button onClick={() => setSelectedUser(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-scroll">
              <div className="inspect-user-header">
                <img 
                  src={selectedUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"} 
                  alt="Avatar" 
                  className="inspect-avatar"
                />
                <div>
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="inspect-user-details-grid">
                <div>
                  <span>Bio</span>
                  <p>{selectedUser.bio || 'None'}</p>
                </div>
                <div>
                  <span>Location</span>
                  <p>{selectedUser.location || 'Global'}</p>
                </div>
                <div>
                  <span>Website</span>
                  <p>{selectedUser.website_url || 'None'}</p>
                </div>
                <div>
                  <span>Node created</span>
                  <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
