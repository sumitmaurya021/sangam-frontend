import apiClient from './client';

export const authApi = {
  // Devise User Sessions
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.delete('/auth/logout'),
  
  // Devise User Registrations
  register: (userData) => apiClient.post('/auth/signup', { user: userData }),
  updateProfile: (id, userData) => apiClient.put(`/users/${id}`, { user: userData }),
  deleteAccount: (id) => apiClient.delete(`/users/${id}`),
  
  // Passwords
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),

  // OTP
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  resendOtp: (userId) => apiClient.post('/auth/resend-otp', { user_id: userId }),

  // TOTP
  enableTotp: () => apiClient.post('/auth/totp/enable'),
  confirmTotp: (code) => apiClient.post('/auth/totp/confirm', { code }),
  disableTotp: () => apiClient.post('/auth/totp/disable'),
};
