import apiClient from './client';

export const socialApi = {
  // Stories
  createStory: (data) => apiClient.post('/stories', data),
  getStory: (id) => apiClient.get(`/stories/${id}`),
  deleteStory: (id) => apiClient.delete(`/stories/${id}`),
  viewStory: (id) => apiClient.post(`/stories/${id}/view`),
  getActiveStories: () => apiClient.get('/stories/active'),
  
  // Story Interactions
  votePoll: (storyId, data) => apiClient.post(`/stories/${storyId}/poll_vote`, data),
  replyQa: (storyId, data) => apiClient.post(`/stories/${storyId}/qa_reply`, data),
  getQaReplies: (storyId) => apiClient.get(`/stories/${storyId}/qa_replies`),

  // Groups
  getGroups: (params) => apiClient.get('/groups', { params }),
  getGroup: (id) => apiClient.get(`/groups/${id}`),
  createGroup: (data) => apiClient.post('/groups', data),
  updateGroup: (id, data) => apiClient.put(`/groups/${id}`, data),
  deleteGroup: (id) => apiClient.delete(`/groups/${id}`),
  joinGroup: (id) => apiClient.post(`/groups/${id}/join`),
  leaveGroup: (id) => apiClient.delete(`/groups/${id}/leave`),
  approveGroupMember: (id, userId) => apiClient.post(`/groups/${id}/approve_member`, { user_id: userId }),
  removeGroupMember: (id, userId) => apiClient.delete(`/groups/${id}/remove_member`, { data: { user_id: userId } }),

  // Events
  getEvents: (params) => apiClient.get('/events', { params }),
  getEvent: (id) => apiClient.get(`/events/${id}`),
  createEvent: (data) => apiClient.post('/events', data),
  updateEvent: (id, data) => apiClient.put(`/events/${id}`, data),
  deleteEvent: (id) => apiClient.delete(`/events/${id}`),
  respondToEvent: (id, response) => apiClient.post(`/events/${id}/respond`, { response }),

  // Bookmarks & Collections
  getBookmarks: (params) => apiClient.get('/bookmarks', { params }),
  getBookmarkCollections: (params) => apiClient.get('/bookmark_collections', { params }),
  createBookmarkCollection: (data) => apiClient.post('/bookmark_collections', data),
  getBookmarkCollection: (id) => apiClient.get(`/bookmark_collections/${id}`),
  updateBookmarkCollection: (id, data) => apiClient.put(`/bookmark_collections/${id}`, data),
  deleteBookmarkCollection: (id) => apiClient.delete(`/bookmark_collections/${id}`),
  addBookmarkToCollection: (id, bookmarkId) => apiClient.patch(`/bookmark_collections/${id}/add_bookmark`, { bookmark_id: bookmarkId }),

  // Memories
  getMemories: () => apiClient.get('/memories'),

  // Fundraisers
  getFundraisers: (params) => apiClient.get('/fundraisers', { params }),
  getFundraiser: (id) => apiClient.get(`/fundraisers/${id}`),
  createFundraiser: (data) => apiClient.post('/fundraisers', data),
  donateToFundraiser: (id, data) => apiClient.post(`/fundraisers/${id}/donate`, data),

  // Marketplace
  getMarketplaceListings: (params) => apiClient.get('/marketplace_listings', { params }),
  getMyMarketplaceListings: () => apiClient.get('/marketplace_listings/my_listings'),
  getMarketplaceListing: (id) => apiClient.get(`/marketplace_listings/${id}`),
  createMarketplaceListing: (data) => apiClient.post('/marketplace_listings', data),
  updateMarketplaceListing: (id, data) => apiClient.put(`/marketplace_listings/${id}`, data),
  deleteMarketplaceListing: (id) => apiClient.delete(`/marketplace_listings/${id}`),
  markMarketplaceListingSold: (id) => apiClient.patch(`/marketplace_listings/${id}/mark_sold`),
};

export const chatApi = {
  // 1-on-1 Conversations
  getConversations: (params) => apiClient.get('/conversations', { params }),
  getConversation: (id) => apiClient.get(`/conversations/${id}`),
  createConversation: (data) => apiClient.post('/conversations', data),
  deleteConversation: (id) => apiClient.delete(`/conversations/${id}`),
  getConversationMessages: (id) => apiClient.get(`/conversations/${id}/messages`),
  createMessage: (conversationId, data) => apiClient.post(`/conversations/${conversationId}/messages`, data),
  deleteMessage: (conversationId, id) => apiClient.delete(`/conversations/${conversationId}/messages/${id}`),

  // Group Chats
  getGroupChats: (params) => apiClient.get('/group_chats', { params }),
  getGroupChat: (id) => apiClient.get(`/group_chats/${id}`),
  createGroupChat: (data) => apiClient.post('/group_chats', data),
  deleteGroupChat: (id) => apiClient.delete(`/group_chats/${id}`),
  addGroupChatMember: (id, userId) => apiClient.post(`/group_chats/${id}/add_member`, { user_id: userId }),
  removeGroupChatMember: (id, userId) => apiClient.delete(`/group_chats/${id}/remove_member`, { data: { user_id: userId } }),
  leaveGroupChat: (id) => apiClient.delete(`/group_chats/${id}/leave`),
  getGroupChatMessages: (id, params) => apiClient.get(`/group_chats/${id}/group_chat_messages`, { params }),
  createGroupChatMessage: (id, data) => apiClient.post(`/group_chats/${id}/group_chat_messages`, data),
  deleteGroupChatMessage: (id, messageId) => apiClient.delete(`/group_chats/${id}/group_chat_messages/${messageId}`),
};
