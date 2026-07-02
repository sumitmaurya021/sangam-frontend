import React, { useState, useEffect } from 'react';
import ReelCard from '../ReelCard/ReelCard';
import CreateReelModal from '../CreateReelModal/CreateReelModal';
import { postsApi } from '../../api';
import { ChevronUp, ChevronDown, Flame, Plus } from 'lucide-react';
import '../../assets/css/Reels.css';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadReels = async () => {
    try {
      const response = await postsApi.getReels();
      const fetchedReels = response.data?.data?.reels || response.data?.reels;
      if (Array.isArray(fetchedReels)) {
        setReels(fetchedReels);
      } else {
        setReels([]);
      }
    } catch (err) {
      console.error('Failed to load reels from API', err);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const handleNext = () => {
    if (activeIndex < reels.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        <p>Loading premium reels feed...</p>
      </div>
    );
  }

  return (
    <div className="reels-container">
      {/* Scroll Controls (Left side) */}
      <div className="reels-nav-column">
        <button 
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="reels-nav-btn"
          style={{ opacity: activeIndex === 0 ? 0.3 : 1, cursor: activeIndex === 0 ? 'default' : 'pointer' }}
        >
          <ChevronUp size={24} />
        </button>
        <span className="reels-nav-counter">
          {activeIndex + 1} / {reels.length}
        </span>
        <button 
          onClick={handleNext}
          disabled={activeIndex === reels.length - 1}
          className="reels-nav-btn"
          style={{ opacity: activeIndex === reels.length - 1 ? 0.3 : 1, cursor: activeIndex === reels.length - 1 ? 'default' : 'pointer' }}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Reel Card Area */}
      <div className="reels-card-wrapper">
        {reels.length > 0 ? (
          <ReelCard reel={reels[activeIndex]} isActive={true} />
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No reels found.</p>
        )}
      </div>

      {/* Info Panel Widget (Right side) */}
      <div className="glass reels-sidebar">
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="glow-btn"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: 'var(--accent-color)', color: '#fff' }}
        >
          <Plus size={16} /> Create Reel
        </button>

        <div>
          <div className="reels-sidebar-header">
            <Flame size={18} color="var(--accent-color)" />
            <h4 className="reels-sidebar-title">Trending Creators</h4>
          </div>
          <p className="reels-sidebar-desc">
            Catch up with the top creators tonight.
          </p>
        </div>

        <div className="reels-sidebar-list">
          {reels.map((r, idx) => (
            <div 
              key={r.id} 
              onClick={() => setActiveIndex(idx)}
              className={`reels-sidebar-item ${idx === activeIndex ? 'active' : ''}`}
            >
              <img 
                src={r.user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100"} 
                alt="Creator Avatar" 
                className="reels-sidebar-avatar"
              />
              <div className="reels-sidebar-details">
                <p className="reels-sidebar-name">
                  {r.user?.name}
                </p>
                <p className="reels-sidebar-caption">
                  {r.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <CreateReelModal 
          onClose={() => setShowCreateModal(false)} 
          onReelCreated={loadReels} 
        />
      )}
    </div>
  );
}

// Sample reels fallback removed to prioritize actual database reels.
