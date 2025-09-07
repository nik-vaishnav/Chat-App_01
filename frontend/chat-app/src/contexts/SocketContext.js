import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react';
import { io } from 'socket.io-client';
import { UserContext } from './UserContext';
import { getId } from '../utils/utils';
import { useNotification } from './NotificationContext';
import { useLocation } from 'react-router-dom';
import { setupSocketListeners } from './socketListeners';

const SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  const { currentUser, isAuthenticated, isLoading, token } = useContext(UserContext);
  const { notify } = useNotification();
  const location = useLocation();

  // 🧠 Connect to socket server
  const connectSocket = useCallback(() => {
    if (!isAuthenticated || isLoading || !currentUser || !token) {
      console.warn('❌ Cannot connect: missing user info or token');
      return;
    }

    if (socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    console.log('🔌 Connecting to socket...');

    const newSocket = io(SERVER_URL, {
      auth: {
        token,
        userId: currentUser._id || currentUser.id,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 📡 Setup all socket event listeners
    setupSocketListeners({
      socket: newSocket,
      notify,
      setIsConnected,
      setOnlineUsers,
      setMessages,
      setConversations,
      setCurrentConversation,
      setTypingUsers,
      setUnreadCounts,
      currentConversation,
      location,
    });

    setSocket(newSocket);
  }, [
    isAuthenticated,
    isLoading,
    currentUser,
    token,
    notify,
    location,
    currentConversation,
    socket,
  ]);

  // ⚡ Auto-connect once user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && currentUser && token && !socket) {
      connectSocket();
    }
  }, [isAuthenticated, isLoading, currentUser, token, socket, connectSocket]);

  // 🧹 Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log('🧹 Disconnecting socket on unmount');
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, [socket]);

  // 🟢 Reset unread count when viewing conversation
  useEffect(() => {
    if (currentConversation) {
      setUnreadCounts((prev) => ({
        ...prev,
        [getId(currentConversation)]: 0,
      }));
    }
  }, [currentConversation]);

  // ✉️ Emit message
  const sendMessage = useCallback((messageData) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', messageData);
    }
  }, [socket, isConnected]);

  // Join/Leave Conversation
  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('joinConversation', conversationId);
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('leaveConversation', conversationId);
    }
  }, [socket, isConnected]);

  // Mark message as seen
  const markMessageAsSeen = useCallback((messageId) => {
    if (socket && isConnected) {
      socket.emit('markMessageSeen', messageId);
    }
  }, [socket, isConnected]);

  // Typing indicator
  const emitTyping = useCallback((conversationId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { conversationId, isTyping });
    }
  }, [socket, isConnected]);

  // Update online status (busy, away, etc.)
  const updateUserStatus = useCallback((status) => {
    if (socket && isConnected) {
      socket.emit('updateStatus', status);
    }
  }, [socket, isConnected]);

  // New conversation
  const createConversation = useCallback((participantIds) => {
    if (socket && isConnected) {
      socket.emit('createConversation', participantIds);
    }
  }, [socket, isConnected]);

  // Manual refresh online users
  const requestOnlineUsers = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('getOnlineUsers');
    }
  }, [socket, isConnected]);

  // 💡 Memoize all context values to avoid re-renders
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    onlineUsers,
    messages,
    conversations,
    currentConversation,
    typingUsers,
    setMessages,
    setConversations,
    setCurrentConversation,
    setOnlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsSeen,
    emitTyping,
    updateUserStatus,
    createConversation,
    connectSocket,
    requestOnlineUsers,
    isUserOnline: (userId) => onlineUsers.some((u) => u.userId === userId),
    getOnlineUser: (userId) => onlineUsers.find((u) => u.userId === userId),
    unreadCounts,
    getUnreadCount: (convId) => unreadCounts[convId] || 0,
    totalUnread: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
    reconnect: () => socket?.connect(),
    disconnect: () => socket?.disconnect(),
  }), [
    socket,
    isConnected,
    onlineUsers,
    messages,
    conversations,
    currentConversation,
    typingUsers,
    unreadCounts,
    connectSocket,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsSeen,
    emitTyping,
    updateUserStatus,
    createConversation,
    requestOnlineUsers,
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };