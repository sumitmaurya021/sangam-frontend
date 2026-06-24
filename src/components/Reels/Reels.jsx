import React, { useState, useEffect } from 'react';
import ReelCard from '../ReelCard/ReelCard';
import { postsApi } from '../../api';
import { ChevronUp, ChevronDown, Flame } from 'lucide-react';
import '../../assets/css/Reels.css';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReels() {
      try {
        const response = await postsApi.getReels();
        if (response.data?.reels && response.data.reels.length > 0) {
          setReels(response.data.reels);
        } else {
          setReels(getSampleReels());
        }
      } catch (err) {
        console.warn('Failed to load reels from API, using premium sample data');
        setReels(getSampleReels());
      } finally {
        setLoading(false);
      }
    }
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
    </div>
  );
}

function getSampleReels() {
  return [
    {
      id: 1,
      caption: "Living the neon dream in Shibuya! 🇯🇵🌌 #cyberpunk #tokyo #nightlife #vibes",
      likes_count: 842,
      comments_count: 54,
      views_count: 14200,
      user: {
        id: 10,
        name: "Rohan Khanna",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150"
      },
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-looking-at-camera-34292-large.mp4",
      music_title: "Neon Horizon",
      music_artist: "Tokyo Synthwave",
      liked_by_current_user: false,
      bookmarked_by_current_user: false
    },
    {
      id: 2,
      caption: "A quiet morning in the Swiss Alps. Peace like nowhere else. 🏔️❄️ #switzerland #travel #nature",
      likes_count: 1205,
      comments_count: 89,
      views_count: 23100,
      user: {
        id: 11,
        name: "Ayesha Sen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
      },
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-sea-from-above-39912-large.mp4",
      music_title: "Alpine Chillout",
      music_artist: "Ethereal Echoes",
      liked_by_current_user: true,
      bookmarked_by_current_user: true
    },
    {
      id: 3,
      caption: "Testing out the new camera setup for cinematic portrait reels. Thoughts? 🎥📸 #cinematic #film #camera",
      likes_count: 432,
      comments_count: 21,
      views_count: 5400,
      user: {
        id: 12,
        name: "Kabir Mehta",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
      },
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-standing-under-neon-light-34290-large.mp4",
      music_title: "Lofi Retro Beats",
      music_artist: "ChillHop Collective",
      liked_by_current_user: false,
      bookmarked_by_current_user: false
    }
  ];
}
