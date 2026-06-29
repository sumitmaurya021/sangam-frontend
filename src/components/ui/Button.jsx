import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  isLoading = false, 
  disabled = false,
  className = '',
  fullWidth = false,
  ...props 
}) {
  let variantClasses = '';
  if (variant === 'primary') {
    variantClasses = 'glow-btn'; // From index.css
  }
  
  const widthClass = fullWidth ? 'btn-full-width' : '';
  const disabledClass = (disabled || isLoading) ? 'btn-disabled' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn-primary ${variantClasses} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="spinner-icon" />
      )}
      <span className={isLoading ? 'btn-content-loading' : ''}>{children}</span>
    </button>
  );
}
