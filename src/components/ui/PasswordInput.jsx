import React, { useState } from 'react';
import Input from './Input';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ label, id, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="floating-input-group" style={{ marginBottom: 0 }}>
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        label={label}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="pass-toggle-btn"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
