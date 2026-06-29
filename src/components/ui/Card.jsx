import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`auth-glass-card ${className}`} {...props}>
      {children}
    </div>
  );
}
