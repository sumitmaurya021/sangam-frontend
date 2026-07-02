import React, { useState } from 'react';
import { Image, BarChart2, HeartHandshake, Globe, Users, Lock, X } from 'lucide-react';
import { postsApi } from '../../api';
import '../../assets/css/CreatePost.css';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [showFundraiserForm, setShowFundraiserForm] = useState(false);
  const [fundraiserTitle, setFundraiserTitle] = useState('');
  const [fundraiserGoal, setFundraiserGoal] = useState('');
  const [fundraiserDesc, setFundraiserDesc] = useState('');

  const [imagePlaceholder, setImagePlaceholder] = useState('');

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imagePlaceholder && !showPollForm && !showFundraiserForm) return;

    const newPostData = {
      id: Date.now(),
      content: content,
      visibility: visibility,
      created_at: 'Just now',
      user: {
        name: 'Ananya Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150'
      },
      image_url: imagePlaceholder || null,
      liked_by_current_user: false,
      likes_count: 0,
      comments: []
    };

    if (showPollForm && pollQuestion) {
      newPostData.poll = {
        question: pollQuestion,
        poll_options: pollOptions.filter(opt => opt.trim() !== '').map((opt, index) => ({
          id: index + 1,
          body: opt,
          votes_count: 0
        }))
      };
    }

    if (showFundraiserForm && fundraiserTitle && fundraiserGoal) {
      newPostData.fundraiser = {
        title: fundraiserTitle,
        description: fundraiserDesc,
        goal_amount: parseFloat(fundraiserGoal) || 1000,
        raised_amount: 0
      };
    }

    try {
      const payload = {
        post: {
          content: content || (imagePlaceholder ? `[Image: ${imagePlaceholder}]` : ''),
          visibility,
        }
      };

      if (showPollForm && pollQuestion) {
        payload.post.poll_attributes = {
          question: pollQuestion,
          poll_options_attributes: pollOptions.filter(opt => opt.trim() !== '').map((opt, index) => ({
            body: opt,
            position: index + 1
          }))
        };
      }

      if (showFundraiserForm && fundraiserTitle && fundraiserGoal) {
        payload.post.fundraiser_attributes = {
          title: fundraiserTitle,
          description: fundraiserDesc,
          goal_amount: parseFloat(fundraiserGoal) || 1000,
        };
      }

      const res = await postsApi.createPost(payload);
      
      // The backend returns the newly created post with a real ID
      if (res.data && res.data.data) {
        onPostCreated(res.data.data);
      } else {
        onPostCreated(newPostData);
      }
    } catch (err) {
      console.warn('API call failed, falling back to local UI state');
      onPostCreated(newPostData);
    }

    setContent('');
    setImagePlaceholder('');
    setShowPollForm(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowFundraiserForm(false);
    setFundraiserTitle('');
    setFundraiserGoal('');
    setFundraiserDesc('');
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleAddSampleImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600'
    ];
    const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setImagePlaceholder(randomImg);
  };

  return (
    <div className="glass createpost-container">
      {/* Top Section */}
      <div className="createpost-top">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" 
          alt="Avatar"
          className="createpost-avatar"
        />
        <textarea
          placeholder="Share your thoughts with the Sangam community..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="createpost-textarea"
        />
      </div>

      {/* Selected Image Preview */}
      {imagePlaceholder && (
        <div className="createpost-preview-container">
          <img src={imagePlaceholder} alt="Preview" className="createpost-preview-img" />
          <button 
            onClick={() => setImagePlaceholder('')}
            className="createpost-preview-remove"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Poll Form Overlay/Insert */}
      {showPollForm && (
        <div className="createpost-form-section">
          <div className="createpost-form-header">
            <span className="createpost-form-title">Create Interactive Poll</span>
            <button onClick={() => setShowPollForm(false)} className="createpost-form-close">
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Ask a question..."
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            className="createpost-input"
          />
          {pollOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handlePollOptionChange(idx, e.target.value)}
              className="createpost-input"
            />
          ))}
          {pollOptions.length < 5 && (
            <button 
              onClick={addPollOption}
              className="createpost-add-option-btn"
            >
              + Add Option
            </button>
          )}
        </div>
      )}

      {/* Fundraiser Form Overlay/Insert */}
      {showFundraiserForm && (
        <div className="createpost-form-section">
          <div className="createpost-form-header">
            <span className="createpost-form-title">Start Fundraiser</span>
            <button onClick={() => setShowFundraiserForm(false)} className="createpost-form-close">
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Fundraiser Title"
            value={fundraiserTitle}
            onChange={(e) => setFundraiserTitle(e.target.value)}
            className="createpost-input"
          />
          <input
            type="number"
            placeholder="Goal Amount ($)"
            value={fundraiserGoal}
            onChange={(e) => setFundraiserGoal(e.target.value)}
            className="createpost-input"
          />
          <textarea
            placeholder="Describe what you are raising funds for..."
            value={fundraiserDesc}
            onChange={(e) => setFundraiserDesc(e.target.value)}
            className="createpost-textarea-field"
          />
        </div>
      )}

      {/* Actions and Submit Bar */}
      <div className="createpost-footer">
        {/* Media Add Buttons */}
        <div className="createpost-media-buttons">
          <button 
            onClick={handleAddSampleImage}
            className="createpost-action-btn"
            title="Add Media"
          >
            <Image size={18} color="#10b981" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Media</span>
          </button>
          
          <button 
            onClick={() => { setShowPollForm(true); setShowFundraiserForm(false); }}
            className="createpost-action-btn"
            title="Create Poll"
          >
            <BarChart2 size={18} color="#3b82f6" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Poll</span>
          </button>

          <button 
            onClick={() => { setShowFundraiserForm(true); setShowPollForm(false); }}
            className="createpost-action-btn"
            title="Start Fundraiser"
          >
            <HeartHandshake size={18} color="#ec4899" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fundraiser</span>
          </button>
        </div>

        {/* Post Visibility selector & Post Button */}
        <div className="createpost-submit-area">
          <div className="createpost-visibility">
            {visibility === 'public' && <Globe size={14} color="var(--text-secondary)" />}
            {visibility === 'friends' && <Users size={14} color="var(--text-secondary)" />}
            {visibility === 'private' && <Lock size={14} color="var(--text-secondary)" />}
            <select 
              value={visibility} 
              onChange={(e) => setVisibility(e.target.value)}
              className="createpost-visibility-select"
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </div>

          <button 
            onClick={handlePostSubmit}
            className="glow-btn createpost-submit-btn"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
