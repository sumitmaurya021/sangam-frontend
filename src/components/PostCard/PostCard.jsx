import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Send, Trash2, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { postsApi } from '../../api';
import '../../assets/css/PostCard.css';

export default function PostCard({ post, onDelete }) {
  const [liked, setLiked] = useState(post.liked_by_current_user || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked_by_current_user || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || [
    { id: 1, user: { name: 'Karan Malhotra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' }, body: 'This looks incredible! So glad to see this.', created_at: '2 hours ago' },
    { id: 2, user: { name: 'Priya Sen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' }, body: 'Fascinating concept. Count me in!', created_at: '1 hour ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Poll state (if post has a poll)
  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState(
    post.poll?.poll_options?.reduce((acc, opt) => ({ ...acc, [opt.id]: opt.votes_count || Math.floor(Math.random() * 45) + 5 }), {}) || {}
  );

  // Fundraiser state (if post has a fundraiser)
  const [raisedAmount, setRaisedAmount] = useState(post.fundraiser?.raised_amount || Math.floor(Math.random() * 4000) + 500);
  const [donationValue, setDonationValue] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  const images = post.images || (post.image_url ? [post.image_url] : []);

  const handleLike = async () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 500);

    const targetState = !liked;
    setLiked(targetState);
    setLikeCount(prev => targetState ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (targetState) {
        await postsApi.likePost(post.id);
      } else {
        await postsApi.unlikePost(post.id);
      }
    } catch (e) {
      console.warn('API call failed, falling back to mock UI update');
    }
  };

  const handleBookmark = async () => {
    const targetState = !bookmarked;
    setBookmarked(targetState);
    try {
      if (targetState) {
        await postsApi.bookmarkPost(post.id);
      } else {
        await postsApi.unbookmarkPost(post.id);
      }
    } catch (e) {
      console.warn('API call failed, falling back to mock UI update');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      id: Date.now(),
      user: {
        name: 'Ananya Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
      },
      body: newComment,
      created_at: 'Just now'
    };

    setComments([tempComment, ...comments]);
    setNewComment('');

    try {
      await postsApi.createComment(post.id, { content: newComment });
    } catch (e) {
      console.warn('API call failed, falling back to mock UI update');
    }
  };

  const handleVote = (optionId) => {
    if (pollVoted) return;
    setPollVoted(true);
    setPollVotes(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1
    }));
  };

  const handleDonate = () => {
    const donation = parseFloat(donationValue);
    if (isNaN(donation) || donation <= 0) return;
    setIsDonating(true);
    
    setTimeout(() => {
      setRaisedAmount(prev => prev + donation);
      setDonationValue('');
      setIsDonating(false);
      alert(`Thank you for your donation of $${donation}!`);
    }, 1000);
  };

  const totalPollVotes = Object.values(pollVotes).reduce((sum, v) => sum + v, 0);

  return (
    <article className="glass postcard-container">
      {/* Header */}
      <div className="postcard-header">
        <div className="postcard-user-area">
          <div className="postcard-avatar-wrapper">
            <img 
              src={post.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'} 
              alt={post.user?.name} 
              className="postcard-avatar-img"
            />
          </div>
          <div>
            <div className="postcard-name-row">
              <span className="postcard-name">{post.user?.name || 'Vihan Verma'}</span>
              <Award size={14} color="var(--accent-color)" />
            </div>
            <span className="postcard-time">{post.created_at || 'Just now'}</span>
          </div>
        </div>
        
        {post.user?.id === 1 && (
          <button 
            onClick={() => onDelete && onDelete(post.id)}
            className="postcard-delete-btn animated-icon"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Caption Content */}
      <p className="postcard-caption">
        {post.content || 'Designing the future of decentralized networks. Here is a sneak peek into the Sangam ecosystem! ✨'}
      </p>

      {/* Images Carousel */}
      {images.length > 0 && (
        <div className="postcard-carousel">
          <img 
            src={images[currentImageIndex]} 
            alt="Post content" 
            className="postcard-carousel-img"
          />

          {images.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                className="postcard-carousel-nav left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                className="postcard-carousel-nav right"
              >
                <ChevronRight size={20} />
              </button>
              <div className="postcard-carousel-dots">
                {images.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`postcard-carousel-dot ${idx === currentImageIndex ? 'active' : 'inactive'}`} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Embedded Poll Feature */}
      {post.poll && (
        <div className="glass postcard-feature-box">
          <p className="postcard-poll-title">📊 {post.poll.question}</p>
          <div className="postcard-poll-options">
            {post.poll.poll_options?.map((opt) => {
              const votes = pollVotes[opt.id] || 0;
              const percentage = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
                  className={`postcard-poll-option-btn ${pollVoted ? 'voted' : ''}`}
                >
                  {pollVoted && (
                    <div 
                      className="postcard-poll-option-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <span>{opt.body}</span>
                  {pollVoted && <span>{percentage}%</span>}
                </button>
              );
            })}
          </div>
          <span className="postcard-time">
            {totalPollVotes} votes • {post.poll.ends_at || 'Ends in 2 days'}
          </span>
        </div>
      )}

      {/* Embedded Fundraiser Feature */}
      {post.fundraiser && (
        <div className="glass postcard-feature-box">
          <div>
            <span className="postcard-fundraiser-tag">FUNDRAISER</span>
            <h4 className="postcard-fundraiser-title">{post.fundraiser.title}</h4>
            <p className="postcard-fundraiser-desc">{post.fundraiser.description}</p>
          </div>

          <div>
            <div className="postcard-fundraiser-amounts">
              <span>Raised ${raisedAmount}</span>
              <span style={{ color: 'var(--text-muted)' }}>Goal ${post.fundraiser.goal_amount}</span>
            </div>
            <div className="postcard-fundraiser-bar-bg">
              <div 
                className="postcard-fundraiser-bar-fill"
                style={{ width: `${Math.min(100, (raisedAmount / post.fundraiser.goal_amount) * 100)}%` }}
              />
            </div>
          </div>

          <div className="postcard-fundraiser-action-row">
            <input
              type="number"
              placeholder="Amount ($)"
              value={donationValue}
              onChange={(e) => setDonationValue(e.target.value)}
              className="postcard-fundraiser-input"
            />
            <button
              onClick={handleDonate}
              disabled={isDonating}
              className="glow-btn"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              {isDonating ? 'Donating...' : 'Donate'}
            </button>
          </div>
        </div>
      )}

      {/* Embedded Link Preview Feature */}
      {post.link_url && (
        <a 
          href={post.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass postcard-link-preview"
        >
          {post.link_image_url && (
            <div className="postcard-link-img-wrapper">
              <img src={post.link_image_url} alt={post.link_title} className="postcard-link-img" />
            </div>
          )}
          <div className="postcard-link-details">
            <span className="postcard-link-domain">{post.link_domain}</span>
            <h4 className="postcard-link-title">{post.link_title}</h4>
            <p className="postcard-link-desc">{post.link_description}</p>
          </div>
        </a>
      )}

      {/* Actions Footer */}
      <div className="postcard-actions">
        <div className="postcard-actions-left">
          <button 
            onClick={handleLike}
            className={`animated-icon postcard-action-btn ${liked ? 'liked' : ''}`}
          >
            <Heart size={20} fill={liked ? 'var(--like-color)' : 'none'} className={likeAnimating ? 'heart-animate' : ''} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{likeCount}</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="animated-icon postcard-action-btn"
          >
            <MessageCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{comments.length}</span>
          </button>

          <button className="animated-icon postcard-action-btn">
            <Share2 size={20} />
          </button>
        </div>

        <button 
          onClick={handleBookmark}
          className={`animated-icon postcard-action-btn ${bookmarked ? 'bookmarked' : ''}`}
        >
          <Bookmark size={20} fill={bookmarked ? 'var(--bookmark-color)' : 'none'} />
        </button>
      </div>

      {/* Interactive Comments Drawer */}
      {showComments && (
        <div className="postcard-comments-section">
          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="postcard-comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="postcard-comment-input"
            />
            <button type="submit" className="postcard-comment-submit">
              <Send size={16} />
            </button>
          </form>

          {/* Comments List */}
          <div className="postcard-comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="postcard-comment-item">
                <img 
                  src={comment.user?.avatar} 
                  alt={comment.user?.name}
                  className="postcard-comment-avatar"
                />
                <div className="postcard-comment-bubble">
                  <div className="postcard-comment-user-row">
                    <span className="postcard-comment-username">{comment.user?.name}</span>
                    <span className="postcard-comment-time">{comment.created_at}</span>
                  </div>
                  <p className="postcard-comment-body">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
