import apiClient from './client';

export const postsApi = {
  // Posts
  getPosts: (params) => apiClient.get('/posts', { params }),
  getPost: (id) => apiClient.get(`/posts/${id}`),
  createPost: (data) => apiClient.post('/posts', data), // Use FormData if file uploads are involved
  updatePost: (id, data) => apiClient.put(`/posts/${id}`, data),
  deletePost: (id) => apiClient.delete(`/posts/${id}`),

  // Post Interactions
  likePost: (id) => apiClient.post(`/posts/${id}/like`),
  unlikePost: (id) => apiClient.delete(`/posts/${id}/unlike`),
  sharePost: (id, data) => apiClient.post(`/posts/${id}/share`, data),
  bookmarkPost: (id) => apiClient.post(`/posts/${id}/bookmark`),
  unbookmarkPost: (id) => apiClient.delete(`/posts/${id}/unbookmark`),
  shareToStory: (id) => apiClient.post(`/posts/${id}/share_to_story`),

  // Post Comments
  createComment: (postId, data) => apiClient.post(`/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => apiClient.delete(`/posts/${postId}/comments/${commentId}`),

  // Articles
  getArticles: (params) => apiClient.get('/articles', { params }),
  getArticle: (id) => apiClient.get(`/articles/${id}`),
  createArticle: (data) => apiClient.post('/articles', data),
  updateArticle: (id, data) => apiClient.put(`/articles/${id}`, data),
  deleteArticle: (id) => apiClient.delete(`/articles/${id}`),

  // Reels
  getReels: (params) => apiClient.get('/reels', { params }),
  createReel: (data) => apiClient.post('/reels', data),
  deleteReel: (id) => apiClient.delete(`/reels/${id}`),
  likeReel: (id) => apiClient.post(`/reels/${id}/like`),
  unlikeReel: (id) => apiClient.delete(`/reels/${id}/unlike`),
  viewReel: (id) => apiClient.post(`/reels/${id}/view`),
  bookmarkReel: (id) => apiClient.post(`/reels/${id}/bookmark_reel`),
  unbookmarkReel: (id) => apiClient.delete(`/reels/${id}/unbookmark_reel`),
  
  // Reel Comments
  getReelComments: (reelId, params) => apiClient.get(`/reels/${reelId}/reel_comments`, { params }),
  createReelComment: (reelId, data) => apiClient.post(`/reels/${reelId}/reel_comments`, data),
  deleteReelComment: (reelId, commentId) => apiClient.delete(`/reels/${reelId}/reel_comments/${commentId}`),
};
