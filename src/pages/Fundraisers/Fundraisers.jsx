import React, { useState, useEffect } from 'react';
import { socialApi } from '../../api';
import { Heart, Plus, DollarSign, Calendar, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Fundraisers.css';

export default function Fundraisers() {
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFundraiser, setSelectedFundraiser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Donate state
  const [donateAmount, setDonateAmount] = useState('');

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal_amount: '',
    currency: 'USD',
    ends_at: ''
  });

  useEffect(() => {
    loadFundraisers();
  }, []);

  const loadFundraisers = async () => {
    setLoading(true);
    try {
      const res = await socialApi.getFundraisers();
      if (res.data) setFundraisers(res.data);
    } catch (err) {
      console.error('Error fetching fundraisers', err);
      // Fallback
      setFundraisers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await socialApi.createFundraiser({ fundraiser: form });
      toast.success('Fundraiser created successfully!');
      setShowCreateModal(false);
      setForm({ title: '', description: '', goal_amount: '', currency: 'USD', ends_at: '' });
      loadFundraisers();
    } catch (err) {
      toast.error('Failed to create fundraiser');
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await socialApi.donateToFundraiser(selectedFundraiser.id, { amount: parseFloat(donateAmount) });
      toast.success(`Donated $${donateAmount} successfully!`);
      setDonateAmount('');
      // Reload fundraiser
      const reloadRes = await socialApi.getFundraiser(selectedFundraiser.id);
      if (reloadRes.data) setSelectedFundraiser(reloadRes.data);
      loadFundraisers();
    } catch (err) {
      toast.error('Donation failed');
    }
  };

  return (
    <div className="fundraisers-page-container">
      <div className="fundraisers-header-row">
        <div>
          <h1>Fundraisers</h1>
          <p>Support community initiatives and charity projects across the network.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="glow-btn create-fundraiser-btn">
          <Plus size={16} /> Start Campaign
        </button>
      </div>

      {loading ? (
        <div className="fundraisers-loader">
          <div className="premium-spinner"></div>
          <p>Syncing fundraising nodes...</p>
        </div>
      ) : fundraisers.length > 0 ? (
        <div className="fundraisers-grid">
          {fundraisers.map(f => {
            const pct = Math.min(((f.raised_amount || 0) / f.goal_amount) * 100, 100).toFixed(0);
            return (
              <div key={f.id} onClick={() => setSelectedFundraiser(f)} className="glass fundraiser-card">
                <div className="fundraiser-icon-wrapper">
                  <Heart size={20} color="#ec4899" fill="#ec4899" />
                </div>
                <h3>{f.title}</h3>
                <p className="fundraiser-desc-preview">{f.description}</p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div className="fundraiser-stats">
                  <span>${f.raised_amount || 0} Raised</span>
                  <span>Goal: ${f.goal_amount}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="fundraisers-empty">
          <Heart size={48} />
          <p>No active fundraisers found.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedFundraiser && (
        <div className="modal-overlay" onClick={() => setSelectedFundraiser(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Campaign Details</h3>
              <button onClick={() => setSelectedFundraiser(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body-scroll">
              <h2>{selectedFundraiser.title}</h2>
              <p className="modal-campaign-desc">{selectedFundraiser.description}</p>
              
              <div className="campaign-stat-summary">
                <div className="stat-bubble">
                  <span>Goal</span>
                  <h4>${selectedFundraiser.goal_amount}</h4>
                </div>
                <div className="stat-bubble">
                  <span>Raised</span>
                  <h4>${selectedFundraiser.raised_amount || 0}</h4>
                </div>
              </div>

              <form onSubmit={handleDonateSubmit} className="donation-form">
                <div className="form-group">
                  <label>Amount to Donate ($)</label>
                  <div className="donate-input-wrapper">
                    <DollarSign size={16} />
                    <input 
                      type="number" 
                      value={donateAmount} 
                      onChange={(e) => setDonateAmount(e.target.value)} 
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="glow-btn donate-submit-btn">Send Donation</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start Fundraising Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form-scroll">
              <div className="form-group">
                <label>Campaign Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Community Garden Fund"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows="3" 
                  placeholder="Provide context..."
                  required
                />
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label>Goal Amount ($)</label>
                  <input 
                    type="number" 
                    value={form.goal_amount} 
                    onChange={(e) => setForm({ ...form, goal_amount: e.target.value })} 
                    placeholder="e.g. 5000"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={form.ends_at} 
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value })} 
                  />
                </div>
              </div>

              <button type="submit" className="glow-btn modal-submit-btn">Publish Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
