import apiClient from './client';

export const miscApi = {
  // AI Features
  generateCaption: (data) => apiClient.post('/api/ai/generate_caption', data),
  generateSmartReplies: (data) => apiClient.post('/api/ai/generate_smart_replies', data),
  generateArticleContent: (data) => apiClient.post('/api/ai/generate_article_content', data),
  autoFillListing: (data) => apiClient.post('/api/ai/auto_fill_listing', data),
  rewriteMessage: (data) => apiClient.post('/api/ai/rewrite_message', data),
  aiSearch: (data) => apiClient.post('/api/ai/search', data),
  recordInteraction: (data) => apiClient.post('/api/interactions', data),

  // Global Search
  search: (params) => apiClient.get('/search', { params }),

  // Hashtags
  getHashtag: (name) => apiClient.get(`/hashtag/${name}`),
  explore: (params) => apiClient.get('/explore', { params }),

  // Notifications
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  getNotificationsDropdown: () => apiClient.get('/notifications/dropdown'),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/mark_read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/mark_all_read'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),

  // Music Search
  searchMusic: (query) => apiClient.get('/music/search', { params: { query } }),

  // Health Check
  checkHealth: () => apiClient.get('/up'),
  
  // Link Preview
  getLinkPreview: (url) => apiClient.get('/link_preview', { params: { url } }),
};
