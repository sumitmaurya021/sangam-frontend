import React, { useState, useEffect } from 'react';
import { socialApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Users, Plus, X, ArrowLeft, LogOut, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Groups.css';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    privacy: 'public'
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await socialApi.getGroups();
      if (res.data) setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups', err);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupDetails = async (id) => {
    try {
      const res = await socialApi.getGroup(id);
      if (res.data) setSelectedGroup(res.data);
    } catch (err) {
      toast.error('Failed to load group details');
    }
  };

  const handleJoinGroup = async (group) => {
    try {
      await socialApi.joinGroup(group.id);
      toast.success(`Joined "${group.name}" successfully!`);
      loadGroups();
      handleGroupDetails(group.id);
    } catch (err) {
      toast.error('Failed to join group');
    }
  };

  const handleLeaveGroup = async (group) => {
    try {
      await socialApi.leaveGroup(group.id);
      toast.success(`Left "${group.name}"`);
      loadGroups();
      handleGroupDetails(group.id);
    } catch (err) {
      toast.error('Failed to leave group');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await socialApi.createGroup({ group: form });
      if (res.data) {
        toast.success(`Group "${form.name}" created!`);
        setShowCreateModal(false);
        setForm({ name: '', description: '', privacy: 'public' });
        loadGroups();
      }
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const isMember = (group) => {
    return group.memberships?.some(m => m.user_id === user.id) || group.user_id === user.id;
  };

  return (
    <div className="groups-page-container">
      
      {selectedGroup ? (
        /* Detailed Group View */
        <div className="group-detail-panel glass">
          <button onClick={() => setSelectedGroup(null)} className="back-btn">
            <ArrowLeft size={16} /> Back to groups
          </button>

          <div className="group-detail-header">
            <div className="group-large-icon">
              <Users size={32} />
            </div>
            <div>
              <h2>{selectedGroup.name}</h2>
              <span className="privacy-badge">{selectedGroup.privacy}</span>
              <p className="member-count">{selectedGroup.memberships?.length || 0} members</p>
            </div>
          </div>

          <div className="group-detail-body">
            <div className="group-desc-section">
              <h4>About this group</h4>
              <p>{selectedGroup.description || 'No description provided.'}</p>
            </div>

            <div className="group-actions">
              {isMember(selectedGroup) ? (
                <button onClick={() => handleLeaveGroup(selectedGroup)} className="leave-btn">
                  <LogOut size={16} /> Leave Group
                </button>
              ) : (
                <button onClick={() => handleJoinGroup(selectedGroup)} className="glow-btn join-btn">
                  Join Group
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid of All Groups */
        <>
          <div className="groups-header-row">
            <div>
              <h1>Groups Portal</h1>
              <p>Explore niche coordinates and associate with active developer guilds.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="glow-btn create-guild-btn">
              <Plus size={16} /> Create Group
            </button>
          </div>

          {loading ? (
            <div className="groups-loader">
              <div className="premium-spinner"></div>
              <p>Fetching cluster nodes...</p>
            </div>
          ) : groups.length > 0 ? (
            <div className="groups-grid">
              {groups.map(g => (
                <div key={g.id} onClick={() => handleGroupDetails(g.id)} className="glass group-card">
                  <div className="group-card-header">
                    <div className="group-icon">
                      <Users size={20} />
                    </div>
                    <span className="group-privacy">{g.privacy}</span>
                  </div>
                  <h3>{g.name}</h3>
                  <p className="group-desc-preview">{g.description || 'No description provided.'}</p>
                  <div className="group-card-footer">
                    <span>{g.memberships?.length || 0} members</span>
                    {isMember(g) ? (
                      <span className="joined-label"><CheckCircle size={14} /> Member</span>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleJoinGroup(g); }} 
                        className="join-card-btn"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="groups-empty">
              <Users size={48} />
              <p>No active groups found.</p>
            </div>
          )}
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form-scroll">
              <div className="form-group">
                <label>Group Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g. Design Enthusiasts"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows="3" 
                  placeholder="What is this guild about?"
                />
              </div>

              <div className="form-group">
                <label>Privacy</label>
                <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button type="submit" className="glow-btn modal-submit-btn">Publish Guild</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
