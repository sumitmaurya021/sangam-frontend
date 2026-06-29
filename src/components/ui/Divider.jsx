import React from 'react';

export default function Divider({ children }) {
  return (
    <div className="glass-divider-container">
      <div className="glass-divider-line"></div>
      {children && <span className="glass-divider-text">{children}</span>}
      <div className="glass-divider-line"></div>
    </div>
  );
}
