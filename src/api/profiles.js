import apiClient from './client';

export const profilesApi = {
  // Profiles
  getProfile: (id) => apiClient.get(`/profiles/${id}`),
  getProfileFriends: (id) => apiClient.get(`/profiles/${id}/friends`),
  getProfileFollowing: (id) => apiClient.get(`/profiles/${id}/following`),
  getProfileFollowers: (id) => apiClient.get(`/profiles/${id}/followers`),
  searchProfiles: (params) => apiClient.get(`/profiles/search`, { params }),
  getFriendsList: () => apiClient.get(`/profiles/friends_list`),
  toggleDarkMode: () => apiClient.post(`/profiles/toggle_dark_mode`),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, { user: data }),
  
  // Follows
  followUser: (id) => apiClient.post(`/follows`, { followee_id: id }),
  unfollowUser: (id) => apiClient.delete(`/follows/${id}`),
  getFollowingList: () => apiClient.get(`/follows/following`),
  getFollowersList: () => apiClient.get(`/follows/followers`),

  // Friendships
  sendFriendRequest: (userId) => apiClient.post('/friendships', { friend_id: userId }),
  cancelFriendRequest: (id) => apiClient.delete(`/friendships/${id}`),
  acceptFriendRequest: (id) => apiClient.post(`/friendships/${id}/accept`),
  rejectFriendRequest: (id) => apiClient.post(`/friendships/${id}/reject`),

  // Close Friends
  getCloseFriends: (userId) => apiClient.get(`/close_friends`, { params: { user_id: userId } }),
  addCloseFriend: (userId, friendId) => apiClient.post(`/close_friends`, { user_id: userId, friend_id: friendId }),
  removeCloseFriend: (userId, id) => apiClient.delete(`/close_friends/${id}`, { params: { user_id: userId } }),

  // Profile Highlights
  getHighlights: (userId) => apiClient.get(`/profile_highlights`, { params: { user_id: userId } }),
  createHighlight: (data) => apiClient.post('/profile_highlights', data),
  updateHighlight: (id, data) => apiClient.put(`/profile_highlights/${id}`, data),
  deleteHighlight: (id) => apiClient.delete(`/profile_highlights/${id}`),
  addStoryToHighlight: (id, storyId) => apiClient.post(`/profile_highlights/${id}/add_story`, { story_id: storyId }),
  removeStoryFromHighlight: (id, storyId) => apiClient.delete(`/profile_highlights/${id}/remove_story`, { data: { story_id: storyId } }),
  getHighlightStories: (id) => apiClient.get(`/profile_highlights/${id}/stories`),
};
