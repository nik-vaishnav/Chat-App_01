import axios from 'axios';
import io from 'socket.io-client';
import { BACKEND_URL, SOCKET_URL } from './config';

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

// 🔑 Declare socket + joinedConversations safely
let socket = null;
const joinedConversations = new Set();

export const socketService = {
  connect: (token) => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);

        joinedConversations.forEach((conversationId) => {
          socket.emit('joinConversation', conversationId);
          console.log(`🔁 Re-joined conversation ${conversationId}`);
        });
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      joinedConversations.clear();
    }
  },

  emit: (event, data) => {
    if (event === 'joinConversation' && data) joinedConversations.add(data);
    else if (event === 'leaveConversation' && data) joinedConversations.delete(data);

    socket?.emit(event, data);
  },

  on: (event, callback) => socket?.on(event, callback),
  off: (event, callback) => socket?.off(event, callback),
  getSocket: () => socket,
};

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // ===== AUTHENTICATION =====
  signUp: async ({ name, email, password, profile_pic }) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, profile_pic });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Sign Up failed');
    }
  },

  login: async ({ email, password }) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { user: userData, token } = res.data.data; // ✅ access inside data

      if (!userData || !token) throw new Error('Invalid login response from server');

      return {
        success: true,
        user: { ...userData, id: userData.id || userData._id },
        token,
        message: res.data.message || 'Login successful',
      };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  },

  validateToken: async () => {
    try {
      const res = await API.get('/auth/validate-token');
      if (res.data.user) res.data.user.id = res.data.user.id || res.data.user._id;
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Token validation failed');
    }
  },

  logout: async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      socketService.disconnect();
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('currentUser');
    }
  },

  // ===== USER MANAGEMENT =====
  fetchUserProfile: async () => {
    try {
      const res = await API.get('/users/profile');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  updateUserProfile: async ({ name, profile_pic, bio }) => {
    try {
      const res = await API.put('/users/profile', { name, profile_pic, bio });
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
        ...res.data.user,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('name', updatedUser.name);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update user profile');
    }
  },

  getAllUsers: async () => {
    try {
      const res = await API.get('/users');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch users');
    }
  },

  searchUsers: async (query) => {
    try {
      const res = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Search failed');
    }
  },

  getOnlineUsers: async () => {
    try {
      const res = await API.get('/users/online');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch online users');
    }
  },

  // ===== FRIENDS =====
  getFriends: async (page = 1, limit = 20) => {
    try {
      const res = await API.get(`/friends?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get friends');
    }
  },

  getFriendRequests: async (type = 'received', page = 1, limit = 20) => {
    try {
      const res = await API.get(`/friends/requests?type=${type}&page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to get friend requests');
    }
  },

  sendFriendRequest: async (recipientId) => {
    if (!recipientId || typeof recipientId !== 'string' || recipientId.trim() === '') {
      throw new Error('Valid recipient ID is required');
    }
    const res = await API.post('/friends/requests', { recipientId });
    return res.data;
  },

  respondToFriendRequest: async (requestId, action) => {
    const res = await API.post(`/friends/requests/${requestId}/respond`, { action });
    return res.data;
  },

  cancelFriendRequest: async (requestId) => {
    const res = await API.delete(`/friends/requests/${requestId}`);
    return res.data;
  },

  removeFriend: async (friendId) => {
    const res = await API.delete(`/friends/${friendId}`);
    return res.data;
  },

  // ===== CONVERSATIONS =====
  getConversations: async () => {
    const res = await API.get('/messages/conversations');
    return res.data;
  },

  createConversation: async (participantId) => {
    const res = await API.post('/messages/conversations', { participantId });
    return res.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const res = await API.get(`/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    return res.data;
  },

  sendMessage: async ({ conversationId, content, type = 'text' }) => {
    const res = await API.post('/messages/send', { conversationId, content, type });
    return res.data;
  },

  markConversationAsRead: async (conversationId) => {
    const res = await API.put(`/messages/conversations/${conversationId}/read`);
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await API.get('/messages/unread-count');
    return res.data;
  },

  searchMessages: async (query, conversationId = null) => {
    const params = new URLSearchParams({ query });
    if (conversationId) params.append('conversationId', conversationId);
    const res = await API.get(`/messages/search?${params.toString()}`);
    return res.data;
  },

  editMessage: async (messageId, content) => {
    const res = await API.put(`/messages/messages/${messageId}`, { content });
    return res.data;
  },

  deleteMessage: async (messageId) => {
    const res = await API.delete(`/messages/messages/${messageId}`);
    return res.data;
  },

  healthCheck: async () => {
    const res = await axios.get(`${BACKEND_URL}/health`);
    return res.data;
  },
};

export default apiService;
