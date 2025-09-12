import axios from 'axios';
import io from 'socket.io-client';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

// Socket.IO setup
let socket = null;
let joinedConversations = new Set();

export const socketService = {
  connect: (token) => {
    if (!socket) {
      socket = io(process.env.REACT_APP_BACKEND_URL, {
        auth: { token },
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);

        // Auto re-join previously joined conversations
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
    if (event === 'joinConversation' && data) {
      joinedConversations.add(data);
    } else if (event === 'leaveConversation' && data) {
      joinedConversations.delete(data);
    }

    socket?.emit(event, data);
  },

  on: (event, callback) => socket?.on(event, callback),
  off: (event, callback) => socket?.off(event, callback),
  getSocket: () => socket
};

// Add request interceptor to include token in headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
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

    // Extract data from backend response
    const data = res.data.data;

    if (!data || !data.user || !data.token) {
      throw new Error('Invalid login response from server');
    }

    const user = data.user;
    const token = data.token;

    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('name', user.name || '');
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Connect socket
    socketService.connect(token);

    return {
      success: true,
      user,
      token,
      message: res.data.message
    };
  } catch (err) {
    console.error('Login API error:', err);
    throw new Error(err.response?.data?.message || err.message || 'Login failed');
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

  validateToken: async () => {
    try {
      const res = await API.get('/auth/validate-token');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Token validation failed');
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
    // ===== USER PREFERENCES =====
  updatePreferences: async ({ language, theme }) => {
    try {
      const res = await API.put('/auth/update-preferences', { language, theme });
      
      // Merge updated preferences into localStorage user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        preferences: res.data.preferences || {
          language: 'english',
          theme: 'light'
        }
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update preferences');
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
    console.log('🌐 API: sendFriendRequest called with:', { recipientId });
    
    try {
      if (!recipientId || typeof recipientId !== 'string' || recipientId.trim() === '') {
        throw new Error('Valid recipient ID is required');
      }

      const res = await API.post('/friends/requests', { recipientId });
      console.log('✅ API: Friend request sent successfully:', res.data);
      return res.data;
    } catch (err) {
      console.error('❌ API: sendFriendRequest error:', err);
      throw new Error(err.response?.data?.message || 'Failed to send friend request');
    }
  },

  respondToFriendRequest: async (requestId, action) => {
    try {
      const res = await API.post(`/friends/requests/${requestId}/respond`, { action });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to respond to friend request');
    }
  },

  cancelFriendRequest: async (requestId) => {
    try {
      const res = await API.delete(`/friends/requests/${requestId}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to cancel friend request');
    }
  },

  removeFriend: async (friendId) => {
    try {
      const res = await API.delete(`/friends/${friendId}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove friend');
    }
  },

  // ===== CONVERSATIONS ===== 
  getConversations: async () => {
    try {
      const res = await API.get('/messages/conversations');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch conversations');
    }
  },

// ===== CONVERSATIONS =====
createConversation: async (participantId) => {
  try {
    const res = await API.post('/messages/conversations', { participantId });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to create conversation');
  }
},

createOrFetchConversation: async (participantId) => {
  return apiService.createConversation(participantId);
},
  
  getMessages: async (conversationId, page = 1, limit = 50) => {  // ✅ FIXED: Updated route
    try {
      const res = await API.get(`/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch messages');
    }
  },

  sendMessage: async ({ conversationId, content, type = 'text' }) => {
    try {
      const res = await API.post('/messages/send', { conversationId, content, type });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to send message');
    }
  },

  markConversationAsRead: async (conversationId) => {  // ✅ FIXED: Correct route
    try {
      const res = await API.put(`/messages/conversations/${conversationId}/read`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to mark conversation as read');
    }
  },

  getUnreadCount: async () => {
    try {
      const res = await API.get('/messages/unread-count');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  searchMessages: async (query, conversationId = null) => {  // ✅ FIXED: Changed q to query
    try {
      const params = new URLSearchParams({ query });
      if (conversationId) params.append('conversationId', conversationId);
      const res = await API.get(`/messages/search?${params.toString()}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to search messages');
    }
  },

  editMessage: async (messageId, content) => {  // ✅ FIXED: Removed /edit
    try {
      const res = await API.put(`/messages/messages/${messageId}`, { content });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to edit message');
    }
  },

  deleteMessage: async (messageId) => {  // ✅ FIXED: Added /messages prefix
    try {
      const res = await API.delete(`/messages/messages/${messageId}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete message');
    }
  },

  // ===== HEALTH =====
  healthCheck: async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      const res = await axios.get(`${baseUrl}/health`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Health check failed');
    }
  }
};

export default apiService;
