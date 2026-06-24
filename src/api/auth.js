import apiClient from './client';

export const authApi = {
  // Devise User Sessions
  login: (credentials) => apiClient.post('/users/sign_in', { user: credentials }),
  logout: () => apiClient.delete('/users/sign_out'),
  
  // Devise User Registrations
  register: (userData) => apiClient.post('/users', { user: userData }),
  updateProfile: (userData) => apiClient.put('/users', { user: userData }),
  deleteAccount: () => apiClient.delete('/users'),
  
  // Passwords
  forgotPassword: (email) => apiClient.post('/users/password', { user: { email } }),
  resetPassword: (data) => apiClient.put('/users/password', { user: data }), // requires reset_password_token

  // 2FA
  setupTwoFactor: () => apiClient.get('/two_factor_auth/setup'),
  enableTwoFactor: (code) => apiClient.post('/two_factor_auth/enable', { code }),
  disableTwoFactor: () => apiClient.delete('/two_factor_auth/disable'),
  verifyTwoFactor: () => apiClient.get('/two_factor_auth/verify'),
  confirmTwoFactor: (code) => apiClient.post('/two_factor_auth/confirm', { code })
};
