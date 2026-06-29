import api from '../api/axios';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/api/v1/auth/signup', { user: userData });
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  verifyOtp: async (data) => {
    const response = await api.post('/api/v1/auth/verify-otp', data);
    return response.data;
  },

  resendOtp: async (userId) => {
    const response = await api.post('/api/v1/auth/resend-otp', { user_id: userId });
    return response.data;
  },

  logout: async () => {
    const response = await api.delete('/api/v1/auth/logout');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/api/v1/auth/change-password', data);
    return response.data;
  }
};
