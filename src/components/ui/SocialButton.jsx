import React from 'react';

export default function SocialButton({ icon: Icon, onClick, label, ...props }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className="social-button"
      aria-label={label}
      {...props}
    >
      <Icon size={20} />
    </button>
  );
}
