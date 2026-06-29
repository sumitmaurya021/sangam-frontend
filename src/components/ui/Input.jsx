import React from 'react';

export default function Input({
  label,
  error,
  id,
  type = 'text',
  className = '',
  icon: Icon,
  placeholder = ' ', // Need a space placeholder for the CSS floating label logic
  ...props
}) {
  return (
    <div className={`floating-input-group ${className}`}>
      {Icon && (
        <div className="floating-input-icon">
          <Icon size={18} />
        </div>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`floating-input ${Icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="floating-label">
          {label}
        </label>
      )}
      {error && (
        <p className="input-error-text animate-fade-in">{error}</p>
      )}
    </div>
  );
}
