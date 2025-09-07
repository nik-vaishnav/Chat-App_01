// ✅ MAIN FIXES APPLIED:
// 1. Added proper error handling for conversation creation
// 2. Improved socket disconnect handling 
// 3. Added error state management
// 4. Fixed API response handling

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { getId } from '../utils/utils';
import { useSocket } from '../contexts/SocketContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import WelcomeScreen from './WelcomeScreen';
import { apiService } from '../services/apiServices';

const ChatMain = ({
  currentUser,
  selectedUser,
  currentConversationId,
  setCurrentConversationId,
  onFriendRemoved,
  refreshSidebar
}) => {
  const { socket, messages, setMessages, isConnected } = useSocket();

  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // ✅ Added error state
  const [friendStatus, setFriendStatus] = useState({
    isFriend: false,
    pending: false,
    sentByMe: false,
    requestId: null
  });

  const requestInProgress = useRef(false);

  // ✅ Clear error message when conversation changes
  useEffect(() => {
    setErrorMessage('');
  }, [selectedUser, currentConversationId]);

  // Fetch friend status when selectedUser or currentUser changes
  useEffect(() => {
    if (!selectedUser || !currentUser?.id) return;

    async function fetchStatus() {
      try {
        const resp = await apiService.getFriends();
        const isFriend = resp.data?.friends?.some(f => getId(f) === getId(selectedUser)) || false;

        let pending = false,
          sentByMe = false,
          requestId = null;

        if (!isFriend) {
          const rec = await apiService.getFriendRequests('received');
          const sent = await apiService.getFriendRequests('sent');

          const myReq = sent.data?.requests?.find(r => {
            const receiverId = typeof r.receiver === 'object' ? getId(r.receiver) : r.receiver;
            return receiverId === getId(selectedUser);
          });

          const theirReq = rec.data?.requests?.find(r => {
            const senderId = typeof r.sender === 'object' ? getId(r.sender) : r.sender;
            return senderId === getId(selectedUser);
          });

          if (myReq) {
            pending = true;
            sentByMe = true;
            requestId = myReq._id;
          } else if (theirReq) {
            pending = true;
            sentByMe = false;
            requestId = theirReq._id;
          }
        }

        setFriendStatus({ isFriend, pending, sentByMe, requestId });
      } catch (error) {
        console.error('Error fetching friend status:', error);
        setFriendStatus({ isFriend: false, pending: false, sentByMe: false, requestId: null });
      }
    }

    fetchStatus();
  }, [selectedUser, currentUser, currentConversationId]);

  // Load conversation messages
  const loadConversationMessages = useCallback(
    async (cid) => {
      setLoading(true);
      setErrorMessage(''); // ✅ Clear error when loading
      try {
        const data = await apiService.getMessages(cid);
        const normalizedMessages = (data.messages || []).map((msg) => ({
          ...msg,
          _id: msg._id || msg.id || `api-${Date.now()}-${Math.random()}`,
          text: msg.content || msg.text,
          msgByUserId: typeof msg.senderId === 'object' ? getId(msg.senderId) : msg.senderId,
          senderId: typeof msg.senderId === 'object' ? getId(msg.senderId) : msg.senderId,
          senderName: typeof msg.senderId === 'object' ? msg.senderId.name : null,
          isLocal: false
        }));
        setMessages(normalizedMessages);
      } catch (err) {
        console.error('Error loading messages:', err);
        setErrorMessage('Failed to load messages. Please try again.');
      }
      setLoading(false);
    },
    [setMessages]
  );

  // Effect: load messages when conversation changes
  const lastLoadedId = useRef(null);

  useEffect(() => {
    if (currentConversationId && currentConversationId !== lastLoadedId.current) {
      console.log('⏬ Loading messages for:', currentConversationId);
      lastLoadedId.current = currentConversationId;
      loadConversationMessages(currentConversationId);
    } else if (!currentConversationId) {
      setMessages([]);
    }
  }, [currentConversationId, loadConversationMessages]);

  // Socket listener: new message
  useEffect(() => {
    const handleIncomingMessage = (message) => {
      const messageConversationId = message.conversationId;
      const selectedUserId = selectedUser ? getId(selectedUser) : null;

      const normalizedMessage = {
        ...message,
        _id: message._id || `socket-${Date.now()}-${Math.random()}`,
        text: message.content || message.text,
        msgByUserId: typeof message.senderId === 'object' ? getId(message.senderId) : message.senderId,
        senderId: typeof message.senderId === 'object' ? getId(message.senderId) : message.senderId,
        senderName: typeof message.senderId === 'object' ? message.senderId.name : null,
        seen: false,
        isLocal: false
      };

      if (currentConversationId && messageConversationId === currentConversationId) {
        setMessages((prev) => {
          const withoutLocal = prev.filter((m) => !(m.isLocal && m.content === normalizedMessage.content));
          return [...withoutLocal, normalizedMessage];
        });
      } else if (
        !currentConversationId &&
        selectedUserId &&
        (normalizedMessage.senderId === selectedUserId || normalizedMessage.msgByUserId === selectedUserId)
      ) {
        setMessages((prev) => [...prev, normalizedMessage]);
      }
    };

    if (socket) {
      socket.on('new_message', handleIncomingMessage);
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleIncomingMessage);
      }
    };
  }, [selectedUser, socket, setMessages, currentConversationId]);

  // ✅ Socket listener: message sent ack (optimistic UI update)
useEffect(() => {
  if (!socket) return;

  const handleAck = ({ tempId, message }) => {
    const normalizedMessage = {
      ...message,
      _id: message._id || message.id || `ack-${Date.now()}-${Math.random()}`,
      text: message.content || message.text,
      msgByUserId:
        typeof message.senderId === 'object'
          ? getId(message.senderId)
          : message.senderId,
      senderId:
        typeof message.senderId === 'object'
          ? getId(message.senderId)
          : message.senderId,
      senderName:
        typeof message.senderId === 'object'
          ? message.senderId.name
          : null,
      isLocal: false,
      seen: false,
    };

    setMessages((prev) =>
      prev.map((m) =>
        m._id === tempId
          ? {
              ...normalizedMessage,
              createdAt: m.createdAt || normalizedMessage.createdAt,
            }
          : m
      )
    );

    setErrorMessage('');
  };

  const handleMessageError = ({ tempId, error }) => {
    setMessages((prev) => prev.filter((m) => m._id !== tempId));
    setErrorMessage('Failed to send message. Please try again.');
  };

socket.on("message_sent_ack", ({ tempId, message }) => {
  setMessages(prev =>
    prev.map(m => (m._id === tempId ? { ...message, createdAt: m.createdAt || message.createdAt } : m))
  );
});
  socket.on('message_send_error', handleMessageError);

  return () => {
socket.on("message_sent_ack", ({ tempId, message }) => {
  setMessages(prev =>
    prev.map(m => (m._id === tempId ? { ...message, createdAt: m.createdAt || message.createdAt } : m))
  );
});
    socket.off('message_send_error', handleMessageError);
  };
}, [socket, setMessages]);

  // ✅ Socket listener: message seen update
  useEffect(() => {
    if (!socket || !currentConversationId) return;

    const handleSeenUpdate = ({ conversationId }) => {
      if (conversationId !== currentConversationId) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.senderId === currentUser.id && !msg.seen) {
            return { ...msg, seen: true };
          }
          return msg;
        })
      );
    };

    socket.on('messageSeenUpdate', handleSeenUpdate);
    return () => socket.off('messageSeenUpdate', handleSeenUpdate);
  }, [socket, currentConversationId, currentUser.id, setMessages]);

  const emitSeenForConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('message:seen', { conversationId });
    }
  }, [socket, isConnected]);

  // Filter current messages for display
  const currentMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (!currentConversationId && selectedUser) {
        return (
          (msg.msgByUserId === currentUser.id && msg.recipientId === getId(selectedUser)) ||
          (msg.msgByUserId === getId(selectedUser) && msg.recipientId === currentUser.id)
        );
      }
      return msg.conversationId === currentConversationId;
    });
  }, [messages, currentConversationId, selectedUser, currentUser.id]);

  // ✅ FIXED: Send message handler with better error handling
  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;

    // ✅ Check socket connection
    if (!socket || !isConnected) {
      setErrorMessage('Connection lost. Please wait while we reconnect...');
      return;
    }

    if (!friendStatus.isFriend) {
      setErrorMessage('You can only chat with friends.');
      return;
    }

    let convId = currentConversationId;

    if (!convId) {
      try {
        setErrorMessage(''); // Clear previous errors
        const res = await apiService.createOrFetchConversation(getId(selectedUser));

        // ✅ FIXED: Better response handling
        console.log('Conversation API response:', res);

        // Try multiple possible response structures
        convId = res.data?.conversationId ||
          res.conversationId ||
          res.data?.conversation?._id ||
          res.data?.conversation?.id ||
          res.data?._id ||
          res.data?.id;

        if (!convId) {
          console.error('No conversation ID found in response:', res);
          throw new Error('Conversation ID missing from backend response.');
        }
        setCurrentConversationId?.(convId); // ✅ THIS LINE NEEDS TO BE ADDED

        console.log('✅ Using conversation ID:', convId);

      } catch (err) {
        console.error('Failed to create or fetch conversation:', err);
        setErrorMessage('Failed to start conversation. Please try again.');
        return;
      }
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const localMessage = {
      _id: tempId,
      conversationId: convId,
      senderId: getId(currentUser),
      msgByUserId: getId(currentUser),
      content: msg.trim(),
      text: msg.trim(),
      type: 'text',
      createdAt: new Date(),
      isLocal: true,
      seen: false
    };

    // ✅ Add optimistic UI update
    setMessages((prev) => [...prev, localMessage]);

    const messageData = {
      conversationId: convId,
      senderId: getId(currentUser),
      content: msg.trim(),
      type: 'text',
      tempId // For ack matching
    };

    try {
      socket.emit('sendMessage', messageData);
    } catch (err) {
      // ✅ Handle socket emit errors
      console.error('Socket emit error:', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setErrorMessage('Failed to send message. Please check your connection.');
    }
  };

  // --- Friend Request Handlers (with better error handling) ---

  const sendRequest = async () => {
    if (requestLoading || requestInProgress.current) return;
    requestInProgress.current = true;
    setRequestLoading(true);
    setErrorMessage(''); // ✅ Clear previous errors

    try {
      await apiService.sendFriendRequest(getId(selectedUser));
      setFriendStatus((prev) => ({ ...prev, pending: true, sentByMe: true }));
      refreshSidebar?.();
    } catch (err) {
      console.error('Send friend request failed:', err);
      setErrorMessage('Failed to send friend request. Please try again.');
    } finally {
      setRequestLoading(false);
      requestInProgress.current = false;
    }
  };

  const cancelRequest = async () => {
    if (requestLoading || requestInProgress.current) return;
    requestInProgress.current = true;
    setRequestLoading(true);
    setErrorMessage('');

    try {
      await apiService.cancelFriendRequest(friendStatus.requestId);
      setFriendStatus((prev) => ({ ...prev, pending: false, sentByMe: false, requestId: null }));
      refreshSidebar?.();
    } catch (err) {
      console.error('Cancel friend request failed:', err);
      setErrorMessage('Failed to cancel friend request. Please try again.');
    } finally {
      setRequestLoading(false);
      requestInProgress.current = false;
    }
  };

  const acceptRequest = async () => {
    if (requestLoading || requestInProgress.current) return;
    requestInProgress.current = true;
    setRequestLoading(true);
    setErrorMessage('');

    try {
      await apiService.respondToFriendRequest(friendStatus.requestId, 'accept');
      setFriendStatus({ isFriend: true, pending: false, sentByMe: false, requestId: null });
      refreshSidebar?.();
    } catch (err) {
      console.error('Accept friend request failed:', err);
      setErrorMessage('Failed to accept friend request. Please try again.');
    } finally {
      setRequestLoading(false);
      requestInProgress.current = false;
    }
  };

  const rejectRequest = async () => {
    if (requestLoading || requestInProgress.current) return;
    requestInProgress.current = true;
    setRequestLoading(true);
    setErrorMessage('');

    try {
      await apiService.respondToFriendRequest(friendStatus.requestId, 'reject');
      setFriendStatus({ isFriend: false, pending: false, sentByMe: false, requestId: null });
      refreshSidebar?.();
    } catch (err) {
      console.error('Reject friend request failed:', err);
      setErrorMessage('Failed to reject friend request. Please try again.');
    } finally {
      setRequestLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleRemoveFriend = async () => {
    if (!selectedUser) return;

    if (!window.confirm(`Are you sure you want to remove ${selectedUser.name} from your friends?`)) {
      return;
    }

    try {
      const friendId = getId(selectedUser);
      await apiService.removeFriend(friendId);
      alert(`${selectedUser.name} has been removed from your friends.`);
      onFriendRemoved?.(friendId);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      setErrorMessage('Failed to remove friend. Please try again.');
    }
  };
  // ✅ Emit 'message:seen' when conversation changes and socket is connected
  useEffect(() => {
    if (currentConversationId && socket && isConnected) {
      emitSeenForConversation(currentConversationId);
    }
  }, [currentConversationId, socket, isConnected, emitSeenForConversation]);


  if (!selectedUser) return <WelcomeScreen />;

  return (
    <Container>
      <ChatHeader selectedUser={selectedUser} onFriendRemoved={handleRemoveFriend} />

      {/* ✅ Display connection status and errors */}
      {!isConnected && (
        <ErrorMessage $type="warning">
          🔌 Reconnecting to server...
        </ErrorMessage>
      )}

      {errorMessage && (
        <ErrorMessage $type="error">
          ❌ {errorMessage}
        </ErrorMessage>
      )}

      <MessageList
        messages={currentMessages}
        currentUser={currentUser}
        selectedUser={selectedUser}
        loading={loading}
        onScrolledToBottom={() => {
          if (currentConversationId && socket && isConnected) {
            console.log('✅ emitting seen for:', currentConversationId);

            emitSeenForConversation(currentConversationId);
          }
        }}
      />

      {friendStatus.isFriend ? (
        <MessageInput
          onSendMessage={handleSendMessage}
          selectedUser={selectedUser}
          disabled={!isConnected} // ✅ Disable when disconnected
        />
      ) : (
        <ActionContainer>
          {!friendStatus.pending ? (
            <ActionButton onClick={sendRequest} disabled={requestLoading || !isConnected}>
              {requestLoading ? 'Sending...' : 'Send Friend Request'}
            </ActionButton>
          ) : friendStatus.sentByMe ? (
            <ActionButton onClick={cancelRequest} disabled={requestLoading || !isConnected}>
              {requestLoading ? 'Cancelling...' : 'Cancel Friend Request'}
            </ActionButton>
          ) : (
            <>
              <ActionButton onClick={acceptRequest} disabled={requestLoading || !isConnected}>
                {requestLoading ? 'Accepting...' : 'Accept'}
              </ActionButton>
              <ActionButton onClick={rejectRequest} disabled={requestLoading || !isConnected}>
                {requestLoading ? 'Rejecting...' : 'Reject'}
              </ActionButton>
            </>
          )}
        </ActionContainer>
      )}
    </Container>
  );
};

export default ChatMain;

// Styled Components

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
`;

const ActionButton = styled.button`
  background-color: ${(props) => (props.disabled ? '#bdc3c7' : '#8e44ad')};
  color: white;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 5px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;
  min-width: 140px;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#bdc3c7' : '#732d91')};
  }
`;

// ✅ New error message component
const ErrorMessage = styled.div`
  padding: 10px 20px;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  
  background-color: ${props =>
    props.$type === 'error' ? '#ffebee' :
      props.$type === 'warning' ? '#fff3e0' : '#e8f5e8'
  };
  
  color: ${props =>
    props.$type === 'error' ? '#c62828' :
      props.$type === 'warning' ? '#ef6c00' : '#2e7d32'
  };
  
  border-bottom: 1px solid ${props =>
    props.$type === 'error' ? '#ffcdd2' :
      props.$type === 'warning' ? '#ffcc02' : '#c8e6c9'
  };
`;