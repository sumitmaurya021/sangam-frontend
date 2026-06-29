import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, User, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import SocialButton from '../../components/ui/SocialButton';
import Divider from '../../components/ui/Divider';
import AuthHero from '../Login/AuthHero';

export default function Register() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    agreeTerms: false
  });
  
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email format is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };

      const response = await authService.signup(payload);
      setUserId(response.data.user_id);
      setOtpStep(true);
      toast.success(response.message || 'Verification code sent to your email.');
    } catch (error) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const mappedErrors = {};
        Object.keys(backendErrors).forEach(key => {
          mappedErrors[key] = `${key} ${backendErrors[key][0]}`;
        });
        setErrors(mappedErrors);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter OTP');

    setLoading(true);
    try {
      const response = await authService.verifyOtp({ 
        user_id: userId, 
        otp 
      });
      
      login(response.data.user, response.data.token, response.data.remember_token);
      toast.success('Account verified successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await authService.resendOtp(userId);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.error(`${provider} login is not configured in the API`);
  };

  const passwordStrength = Math.min(100, Math.max(0, (formData.password.length / 10) * 100));
  const getStrengthClass = () => {
    if (passwordStrength < 40) return 'strength-weak';
    if (passwordStrength < 70) return 'strength-medium';
    return 'strength-strong';
  };

  return (
    <div className="auth-page-container">
      {/* Dynamic Ambient Background */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>
      <div className="grid-overlay"></div>

      <div className="auth-grid-wrapper">
        {/* Left Column: Visual Panel */}
        <AuthHero />

        {/* Right Column: Interactive Form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper" style={{ padding: '2rem 0' }}>
          <Card>
            {!otpStep ? (
              <>
                <h2 className="auth-card-title" style={{ marginBottom: '0.5rem' }}>Create your account</h2>
                <p className="auth-subtitle" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Get started with your free creator workspace
                </p>

                {/* Social Login Grid */}
                <div className="social-grid">
                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Google')} 
                    className="social-button btn-google"
                    aria-label="Sign up with Google"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin('GitHub')} 
                    className="social-button btn-github"
                    aria-label="Sign up with GitHub"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Apple')} 
                    className="social-button btn-apple"
                    aria-label="Sign up with Apple"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/></svg>
                  </button>
                </div>

                <Divider>Or sign up with email</Divider>

                <form onSubmit={handleRegisterSubmit}>
                  <Input
                    id="name"
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                  />

                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <PasswordInput
                      id="password"
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                    />
                    {formData.password && !errors.password && (
                      <div className="password-strength-container">
                        <div 
                          className={`password-strength-bar ${getStrengthClass()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <PasswordInput
                    id="password_confirmation"
                    label="Confirm Password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    error={errors.password_confirmation}
                  />

                  <div className="checkbox-group">
                    <div className="checkbox-input-wrapper align-start">
                      <input
                        id="agreeTerms"
                        type="checkbox"
                        className={`form-checkbox ${errors.agreeTerms ? 'has-error' : ''}`}
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <label htmlFor="agreeTerms" className="checkbox-label" style={{ fontSize: '0.8rem' }}>
                        I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                  {errors.agreeTerms && (
                    <p className="input-error-text" style={{ marginTop: '-1rem', marginBottom: '1rem' }}>
                      {errors.agreeTerms}
                    </p>
                  )}

                  <Button type="submit" fullWidth isLoading={loading}>
                    Register Account
                  </Button>
                </form>
              </>
            ) : (
              <div className="animate-fade-in">
                <div className="otp-header">
                  <div className="otp-icon-wrapper">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="auth-card-title" style={{ marginBottom: '0.5rem' }}>Security Verification</h2>
                  <p className="auth-subtitle" style={{ fontSize: '0.85rem' }}>
                    Enter the code sent to <span className="otp-email">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit}>
                  <Input
                    id="otp"
                    type="text"
                    label="6-Digit Verification Code"
                    className="otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" fullWidth isLoading={loading}>
                      Complete Registration
                    </Button>
                  </div>
                </form>

                <p className="otp-resend">
                  Didn't receive the code?{' '}
                  <button type="button" onClick={resendOtp} className="btn-link">
                    Resend OTP
                  </button>
                </p>
              </div>
            )}

            {!otpStep && (
              <p className="auth-footer" style={{ marginTop: '2rem' }}>
                Already have an account?{' '}
                <Link to="/login" className="btn-link" style={{ fontWeight: '600' }}>
                  Sign in
                </Link>
              </p>
            )}
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
