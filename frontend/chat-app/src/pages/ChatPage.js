import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Navbar from '../components/Navbar';
import ChatSidebar from '../components/ChatSidebar';
import ChatMain from '../components/ChatMain';
import { apiService } from '../services/apiServices';
import { getId } from '../utils/utils';
import { useSocket } from '../contexts/SocketContext';

const ChatPage = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { setName, currentUser, setCurrentUser } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);

  const {
    connectSocket,
    joinConversation,
    leaveConversation,
    socket,
    onlineUsers, // ✅ use directly from context
  } = useSocket();

  // Join/Leave conversation room
  useEffect(() => {
    if (currentConversationId) joinConversation(currentConversationId);
    return () => {
      if (currentConversationId) leaveConversation(currentConversationId);
    };
  }, [currentConversationId, joinConversation, leaveConversation]);

  // Fetch user's conversations
  const loadConversations = async () => {
    try {
      const data = await apiService.getConversations();
      const convoArray = Array.isArray(data?.data?.conversations)
        ? data.data.conversations
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : null;

      if (convoArray) {
        setConversations(convoArray);
      } else {
        console.warn("Conversations response is not an array.", data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
  };

  // Initialization
  useEffect(() => {
    let isMounted = true;

    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        let user = routerLocation.state?.user;

        if (!user) {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            try {
              user = JSON.parse(savedUser);
            } catch {
              localStorage.removeItem('currentUser');
            }
          }
        }

        if (!user) {
          const data = await apiService.validateToken();
          if (data.success && data.user) {
            user = {
              name: data.user.name,
              email: data.user.email,
              id: getId(data.user),
              profile_pic: data.user.profile_pic,
            };
            localStorage.setItem('name', user.name);
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            throw new Error('Token validation failed');
          }
        }

        if (user) {
          setCurrentUser(user);
          setName(user.name);
          connectSocket?.(); // ✅ connect socket here
          await loadConversations();
          setLoading(false);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        navigate('/login');
      }
    };

    initializeUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    const userId = getId(user);
    if (!userId) {
      setCurrentConversationId(null);
      return;
    }

    const existingConversation = conversations
      .filter(conv => conv.participants?.some(p => getId(p) === userId))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    if (existingConversation) {
      setCurrentConversationId(getId(existingConversation));
    } else {
      setCurrentConversationId(null);
    }
  };

  const handleFriendRemoved = (removedUserId) => {
    setConversations(prev =>
      prev.filter(conv =>
        !conv.participants.some(p => getId(p) === removedUserId)
      )
    );

    if (selectedUser && getId(selectedUser) === removedUserId) {
      setSelectedUser(null);
      setCurrentConversationId(null);
    }
  };

  if (loading) {
    return <PageContainer><LoadingMessage>Loading...</LoadingMessage></PageContainer>;
  }

  if (!currentUser) {
    return <PageContainer><LoadingMessage>Error loading user data</LoadingMessage></PageContainer>;
  }

  return (
    <PageContainer>
      <Navbar />
      <ChatContainer>
        <ChatSidebar
          currentUser={currentUser}
          onUserSelect={handleUserSelect}
          selectedUser={selectedUser}
          onlineUsers={onlineUsers} // ✅ now from context
        />
        <ChatMain
          currentUser={currentUser}
          selectedUser={selectedUser}
          currentConversationId={currentConversationId}
          setCurrentConversationId={setCurrentConversationId} // 👈 add this
          onFriendRemoved={handleFriendRemoved}
        />
      </ChatContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Poppins", sans-serif;
`;

const ChatContainer = styled.div`
  display: flex;
  flex: 1;
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: white;
`;

export default ChatPage;