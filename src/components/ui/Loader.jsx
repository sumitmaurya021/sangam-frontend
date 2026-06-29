import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ size = 40, className = '' }) {
  return (
    <div className={`loader-container ${className}`}>
      <Loader2 
        size={size} 
        className="loader-icon" 
      />
    </div>
  );
}
