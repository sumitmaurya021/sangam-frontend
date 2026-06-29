import React from 'react';
import { Sparkles, MessageSquare, Heart } from 'lucide-react';

export default function AuthHero() {
  return (
    <div className="auth-hero-panel">
      {/* Premium Branding Header */}
      <div className="premium-logo-group">
        <span className="premium-logo-text">Sangam</span>
        <span className="premium-logo-glow">PREMIUM</span>
      </div>

      {/* Hero Central Content */}
      <div className="hero-main-content">
        <h2 className="hero-heading">
          Connect. Create.<br />
          <span>Inspire the Future.</span>
        </h2>
        <p className="hero-subtext">
          Step into a curated digital universe designed for high-fidelity creators. 
          Share stories, publish reels, and build deep connections.
        </p>

        {/* Floating Widgets Visual Showcase */}
        <div className="floating-visuals-container">
          {/* Post Widget Mockup */}
          <div className="floating-widget widget-post">
            <div className="widget-header">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Avatar" 
                className="widget-avatar" 
              />
              <div>
                <p className="widget-username">Sarah Jenkins</p>
                <p className="widget-time">Just now • Creative Director</p>
              </div>
            </div>
            <p className="widget-body">
              Just launched the new spatial design guidelines. The feedback on the mesh aesthetics has been incredible! ✨
            </p>
          </div>

          {/* Activity Widget Mockup */}
          <div className="floating-widget widget-activity">
            <div className="widget-header" style={{ marginBottom: 0 }}>
              <div 
                className="widget-avatar" 
                style={{ 
                  background: 'var(--accent-bg-glow)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderColor: 'rgba(168, 85, 247, 0.4)'
                }}
              >
                <Heart size={14} className="heart-animate" color="var(--accent-color)" />
              </div>
              <div>
                <p className="widget-username">Interactive Feed</p>
                <p className="widget-time">1.2k active nodes online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>API v1.2 Secure</span>
        <span>•</span>
        <span>Sangam Cloud Services</span>
      </div>
    </div>
  );
}
