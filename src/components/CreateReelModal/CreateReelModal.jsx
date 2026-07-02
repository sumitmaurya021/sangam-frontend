import React, { useState, useRef } from 'react';
import { X, Upload, Video, Music, AlignLeft, Sparkles, Loader2 } from 'lucide-react';
import { postsApi } from '../../api';
import toast from 'react-hot-toast';
import './CreateReelModal.css';

export default function CreateReelModal({ onClose, onReelCreated }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB client side limit
        toast.error('Video must be under 50MB.');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please drop a valid video file.');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video for your Reel.');
      return;
    }

    const formData = new FormData();
    formData.append('reel[video]', videoFile);
    formData.append('reel[caption]', caption);
    formData.append('reel[music_title]', musicTitle);
    formData.append('reel[music_artist]', musicArtist);
    formData.append('reel[hashtags]', hashtags);

    setIsUploading(true);
    try {
      const res = await postsApi.createReel(formData);
      if (res.data?.success) {
        toast.success('Reel uploaded successfully!');
        if (onReelCreated) onReelCreated();
        onClose();
      } else {
        toast.error(res.data?.message || 'Failed to upload Reel');
      }
    } catch (err) {
      console.error('Error creating reel', err);
      toast.error(err.response?.data?.message || 'Failed to upload Reel');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-reel-overlay">
      <div className="glass create-reel-modal">
        {/* Modal Header */}
        <div className="create-reel-header">
          <div className="create-reel-title-wrapper">
            <Sparkles size={18} color="var(--accent-color)" />
            <h3>Create a Reel</h3>
          </div>
          <button className="create-reel-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="create-reel-form">
          <div className="create-reel-grid">
            {/* Left side: Upload Area / Video Preview */}
            <div className="create-reel-upload-section">
              {videoPreview ? (
                <div className="create-reel-preview-wrapper">
                  <video src={videoPreview} controls playsInline className="create-reel-preview-video" />
                  <button 
                    type="button" 
                    className="create-reel-remove-video"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                    }}
                  >
                    Change Video
                  </button>
                </div>
              ) : (
                <div 
                  className="create-reel-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload size={36} color="var(--text-muted)" />
                  <p className="dropzone-text-primary">Drag & drop your video here</p>
                  <p className="dropzone-text-secondary">or click to browse from files</p>
                  <span className="dropzone-limit">Supports MP4, WebM (Max 50MB)</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleVideoChange} 
                    accept="video/*" 
                    style={{ display: 'none' }} 
                  />
                </div>
              )}
            </div>

            {/* Right side: Input details */}
            <div className="create-reel-details-section">
              <div className="form-group-reel">
                <label className="form-label-reel">
                  <AlignLeft size={14} /> Caption
                </label>
                <textarea
                  placeholder="Share a thought, trends, or vibes..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="form-input-reel textarea"
                />
              </div>

              <div className="form-group-reel-row">
                <div className="form-group-reel">
                  <label className="form-label-reel">
                    <Music size={14} /> Music Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chill Beats"
                    value={musicTitle}
                    onChange={(e) => setMusicTitle(e.target.value)}
                    className="form-input-reel"
                  />
                </div>

                <div className="form-group-reel">
                  <label className="form-label-reel">
                    <Music size={14} /> Artist
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lofi Producer"
                    value={musicArtist}
                    onChange={(e) => setMusicArtist(e.target.value)}
                    className="form-input-reel"
                  />
                </div>
              </div>

              <div className="form-group-reel">
                <label className="form-label-reel">
                  Hashtags
                </label>
                <input
                  type="text"
                  placeholder="e.g. #vibes #trend #neon"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="form-input-reel"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading} 
                className="glow-btn create-reel-submit-btn"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Uploading Reel...
                  </>
                ) : (
                  <>
                    <Video size={16} /> Publish Reel
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
