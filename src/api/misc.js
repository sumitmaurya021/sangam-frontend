import apiClient from './client';
import axios from 'axios';

export const miscApi = {
  // AI Features
  generateCaption: (data) => apiClient.post('/ai_features/generate_caption', data),
  generateSmartReplies: (data) => apiClient.post('/ai_features/generate_smart_replies', data),
  generateArticleContent: (data) => apiClient.post('/ai_features/generate_article_content', data),
  autoFillListing: (data) => apiClient.post('/ai_features/auto_fill_listing', data),
  rewriteMessage: (data) => apiClient.post('/ai_features/rewrite_message', data),
  aiSearch: (params) => apiClient.get('/ai_features/search', { params }),
  recordInteraction: (data) => apiClient.post('/interactions', data),

  // Global Search
  search: (params) => apiClient.get('/search', { params }),

  // Hashtags
  getHashtag: (id) => apiClient.get(`/hashtags/${id}`),
  explore: (params) => apiClient.get('/hashtags/explore', { params }),

  // Notifications
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  getNotificationsDropdown: () => apiClient.get('/notifications/dropdown'),
  markNotificationRead: (id) => apiClient.post(`/notifications/${id}/mark_read`),
  markAllNotificationsRead: () => apiClient.post('/notifications/mark_all_read'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

  // Music Search
  searchMusic: (query) => apiClient.get('/music_search', { params: { query } }),

  // Health Check using the base host root
  checkHealth: () => axios.get(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'),
  
  // Link Preview
  getLinkPreview: (url) => apiClient.get('/link_previews', { params: { url } }),

  // Admin Dashboard
  adminGetStats: () => apiClient.get('/admin/dashboard'),
  adminGetUsers: (params) => apiClient.get('/admin/dashboard/users', { params }),
  adminGetPosts: (params) => apiClient.get('/admin/dashboard/posts', { params }),
  adminGetUserDetails: (id) => apiClient.get(`/admin/dashboard/users/${id}`),
};
