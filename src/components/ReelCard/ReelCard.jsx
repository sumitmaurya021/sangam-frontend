import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { postsApi } from '../../api';
import '../../assets/css/ReelCard.css';

export default function ReelCard({ reel, isActive }) {
  const [liked, setLiked] = useState(reel.liked_by_current_user || false);
  const [likeCount, setLikeCount] = useState(reel.likes_count || 120);
  const [bookmarked, setBookmarked] = useState(reel.bookmarked_by_current_user || false);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Autoplay blocked:', err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 500);

    const targetState = !liked;
    setLiked(targetState);
    setLikeCount(prev => targetState ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (targetState) {
        await postsApi.likeReel(reel.id);
      } else {
        await postsApi.unlikeReel(reel.id);
      }
    } catch (err) {
      console.warn('API call failed, using mock UI update');
    }
  };

  const handleDoubleTap = () => {
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 800);
    if (!liked) {
      handleLike();
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    const targetState = !bookmarked;
    setBookmarked(targetState);

    try {
      if (targetState) {
        await postsApi.bookmarkReel(reel.id);
      } else {
        await postsApi.unbookmarkReel(reel.id);
      }
    } catch (err) {
      console.warn('API call failed, using mock');
    }
  };

  return (
    <div 
      className="reelcard-container"
      onClick={togglePlay}
      onDoubleClick={handleDoubleTap}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={reel.video_url || "https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-in-the-sea-from-above-39912-large.mp4"}
        loop
        muted={muted}
        playsInline
        className="reelcard-video"
      />

      {/* Play/Pause Large Overlay Indicator */}
      {!isPlaying && (
        <div className="reelcard-overlay-indicator">
          <Play size={36} fill="white" />
        </div>
      )}

      {/* Double Tap Heart Pop */}
      {showHeartPop && (
        <div className="reelcard-heart-pop">
          <Heart size={80} fill="var(--like-color)" />
        </div>
      )}

      {/* Floating Sound Toggle */}
      <button 
        onClick={toggleMute}
        className="reelcard-mute-btn"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Left Sidebar Info Panel (Bottom Left overlay) */}
      <div className="reelcard-info-panel" onClick={(e) => e.stopPropagation()}>
        {/* User Details */}
        <div className="reelcard-user-row">
          <img 
            src={reel.user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"} 
            alt={reel.user?.name}
            className="reelcard-user-avatar"
          />
          <span className="reelcard-user-name">{reel.user?.name || "Riya Sen"}</span>
          <button className="reelcard-follow-btn">
            Follow
          </button>
        </div>

        {/* Caption */}
        <p className="reelcard-caption">
          {reel.caption || "Exploring neon aesthetics in Tokyo nights 🌃✨ #travel #tokyo #cyberpunk"}
        </p>

        {/* Music Audio Ticker */}
        <div className="reelcard-music-row">
          <Music size={14} />
          <div className="reelcard-music-marquee-wrapper">
            <div className="reelcard-music-marquee">
              {reel.music_title || "Original Audio"} - {reel.music_artist || "Riya Sen"}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Right Interaction Actions Sidebar */}
      <div className="reelcard-actions-sidebar" onClick={(e) => e.stopPropagation()}>
        {/* Like */}
        <div className="reelcard-action-btn-wrapper">
          <button 
            onClick={handleLike}
            className="reelcard-action-btn"
          >
            <Heart size={22} fill={liked ? 'var(--like-color)' : 'none'} color={liked ? 'var(--like-color)' : 'white'} className={likeAnimating ? 'heart-animate' : ''} />
          </button>
          <span className="reelcard-action-btn-label">{likeCount}</span>
        </div>

        {/* Comment */}
        <div className="reelcard-action-btn-wrapper">
          <button className="reelcard-action-btn">
            <MessageCircle size={22} color="white" />
          </button>
          <span className="reelcard-action-btn-label">{reel.comments_count || 12}</span>
        </div>

        {/* Share */}
        <button className="reelcard-action-btn">
          <Share2 size={22} color="white" />
        </button>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="reelcard-action-btn">
          <Bookmark size={22} fill={bookmarked ? 'var(--bookmark-color)' : 'none'} color={bookmarked ? 'var(--bookmark-color)' : 'white'} />
        </button>

        {/* Moving Disc Icon */}
        <div className="spin-disc reelcard-music-disc">
          <Music size={12} color="white" />
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
