import { getId } from '../utils/utils';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSocket } from '../contexts/SocketContext';
import { formatTimestamp } from '../utils/formatTimestamp';

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDateHeader = (date) => {
  const now = new Date();
  const msgDate = new Date(date);

  if (isSameDay(now, msgDate)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(yesterday, msgDate)) return 'Yesterday';

  return msgDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Enhanced utility functions
const isValidEmoji = (text) => {
  const emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Presentation}]+$/u;
  return emojiRegex.test(text.trim());
};

const containsOnlyEmojis = (text) => {
  const cleanText = text.trim();
  return cleanText.length > 0 && isValidEmoji(cleanText);
};

const linkifyText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <MessageLink key={index} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </MessageLink>
      );
    }
    return part;
  });
};

const MessageList = ({
  messages,
  currentUser,
  selectedUser,
  loading,
  onScrolledToBottom,
  onMessageReact,
  onMessageDelete,
  onMessageEdit,
}) => {
  const { currentConversation, typingUsers } = useSocket();
  const selectedConversationId = currentConversation && getId(currentConversation);
  const typing =
    selectedConversationId &&
    selectedUser &&
    typingUsers[selectedConversationId]?.includes(getId(selectedUser));

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 5;
      const isNearTop = scrollTop < 100;
      
      setShowScrollButton(!isAtBottom && scrollHeight > clientHeight * 1.5);
      
      if (isAtBottom) {
        onScrolledToBottom?.();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onScrolledToBottom]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Message interaction handlers
  const handleMessageClick = useCallback((messageId) => {
    setSelectedMessage(selectedMessage === messageId ? null : messageId);
  }, [selectedMessage]);

  const handleReaction = useCallback((messageId, emoji) => {
    onMessageReact?.(messageId, emoji);
  }, [onMessageReact]);

  // Memoized unique messages
const uniqueMessages = useMemo(() => {
  const seenSet = new Set();
  return messages.filter((msg) => {
    const tempId = msg.tempId;
    const serverId = msg._id;
    const key =
      tempId || serverId || `${msg.senderId}-${msg.content}-${new Date(msg.createdAt).getTime()}`;
    if (seenSet.has(key)) return false;
    seenSet.add(key);
    return true;
  });
}, [messages]);

  if (loading) {
    return (
      <MessageContainer ref={scrollContainerRef}>
        <LoadingIndicator>
          <LoadingSpinner />
          <LoadingText>Loading messages...</LoadingText>
        </LoadingIndicator>
      </MessageContainer>
    );
  }

  let lastDate = null;
  let lastSender = null;

  return (
    <MessageContainer ref={scrollContainerRef}>
      {uniqueMessages.length > 0 ? (
        uniqueMessages.map((msg, index) => {
          const messageId = msg.tempId || msg._id || `msg-${index}`;
          const senderId = msg.senderId || msg.msgByUserId;
          const senderIdString = typeof senderId === 'object' ? getId(senderId) : senderId;
          const messageContent = msg.content || msg.text || '';
          const isOwnMessage =
            senderIdString === currentUser.id || senderIdString === getId(currentUser);

          const msgDate = new Date(msg.createdAt);
          const showDateHeader = !lastDate || !isSameDay(msgDate, lastDate);
          const showAvatar = !isOwnMessage && (showDateHeader || lastSender !== senderIdString);
          const isEmojiOnly = containsOnlyEmojis(messageContent);
          const isSelected = selectedMessage === messageId;
          const isHovered = hoveredMessage === messageId;
          
          if (showDateHeader) lastDate = msgDate;
          lastSender = senderIdString;

          return (
            <React.Fragment key={messageId}>
              {showDateHeader && (
                <DateDivider>
                  <DateBadge>{formatDateHeader(msg.createdAt)}</DateBadge>
                </DateDivider>
              )}
              <MessageWrapper 
                $isOwnMessage={isOwnMessage}
                $showAvatar={showAvatar}
                onMouseEnter={() => setHoveredMessage(messageId)}
                onMouseLeave={() => setHoveredMessage(null)}
                onClick={() => handleMessageClick(messageId)}
              >
                {showAvatar && !isOwnMessage && (
                  <MessageAvatar>
                    {(msg.senderName || selectedUser?.name || 'U')[0].toUpperCase()}
                  </MessageAvatar>
                )}
                <ChatMessage $isOwnMessage={isOwnMessage} $showAvatar={showAvatar}>
                  <MessageBubble 
                    $isOwnMessage={isOwnMessage} 
                    $isEmojiOnly={isEmojiOnly}
                    $isSelected={isSelected}
                    $isHovered={isHovered}
                  >
                    {!isEmojiOnly && (
                      <MessageHeader $isOwnMessage={isOwnMessage}>
                        <Sender $isOwnMessage={isOwnMessage}>
                          {isOwnMessage ? 'You' : msg.senderName || selectedUser?.name || 'Unknown'}
                        </Sender>
                        <Timestamp title={formatTimestamp(msg.createdAt)}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </Timestamp>
                      </MessageHeader>
                    )}
                    <Message $isOwnMessage={isOwnMessage} $isEmojiOnly={isEmojiOnly}>
                      {isEmojiOnly ? messageContent : linkifyText(messageContent)}
                    </Message>
                    {isEmojiOnly && (
                      <EmojiTimestamp title={formatTimestamp(msg.createdAt)}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </EmojiTimestamp>
                    )}
                  </MessageBubble>
                  
                  {/* Message Actions */}
                  {(isHovered || isSelected) && (
                    <MessageActions $isOwnMessage={isOwnMessage}>
                      <ActionButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(messageId, '👍');
                        }}
                        title="Like"
                      >
                        👍
                      </ActionButton>
                      <ActionButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(messageId, '❤️');
                        }}
                        title="Love"
                      >
                        ❤️
                      </ActionButton>
                      <ActionButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(messageId, '😂');
                        }}
                        title="Laugh"
                      >
                        😂
                      </ActionButton>
                      {isOwnMessage && (
                        <>
                          <ActionButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessageEdit?.(messageId, messageContent);
                            }}
                            title="Edit"
                          >
                            ✏️
                          </ActionButton>
                          <ActionButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessageDelete?.(messageId);
                            }}
                            title="Delete"
                          >
                            🗑️
                          </ActionButton>
                        </>
                      )}
                    </MessageActions>
                  )}

                  {/* Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <ReactionsContainer $isOwnMessage={isOwnMessage}>
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <ReactionBadge 
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(messageId, emoji);
                          }}
                          $isActive={users.includes(currentUser.id)}
                        >
                          {emoji} {users.length}
                        </ReactionBadge>
                      ))}
                    </ReactionsContainer>
                  )}

                  {/* Delivery Status */}
                  {isOwnMessage && (
                    <SeenIndicator $seen={msg.seen}>
                      {msg.isLocal ? (
                        <StatusIcon>⏳</StatusIcon>
                      ) : msg.seen ? (
                        <StatusIcon $seen>✓✓</StatusIcon>
                      ) : (
                        <StatusIcon>✓</StatusIcon>
                      )}
                    </SeenIndicator>
                  )}
                </ChatMessage>
              </MessageWrapper>
            </React.Fragment>
          );
        })
      ) : (
        <EmptyStateContainer>
          <EmptyStateIcon>💬</EmptyStateIcon>
          <EmptyStateText>Start your conversation with {selectedUser?.name}!</EmptyStateText>
          <EmptyStateSubtext>Send a message to begin chatting</EmptyStateSubtext>
        </EmptyStateContainer>
      )}

      {/* Typing Indicator */}
      {typing && selectedUser && (
        <TypingIndicatorContainer>
          <TypingAvatar>
            {(selectedUser.name || 'U')[0].toUpperCase()}
          </TypingAvatar>
          <TypingBubble>
            <TypingDots>
              <Dot />
              <Dot />
              <Dot />
            </TypingDots>
          </TypingBubble>
          <TypingText>{selectedUser.name} is typing...</TypingText>
        </TypingIndicatorContainer>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <ScrollToBottomButton onClick={scrollToBottom}>
          <ScrollIcon>↓</ScrollIcon>
        </ScrollToBottomButton>
      )}

      <div ref={messagesEndRef} />
    </MessageContainer>
  );
};

// Enhanced Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
  60% {
    transform: translateY(-4px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
`;

// Enhanced Styled Components
const MessageContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  scroll-behavior: smooth;
  position: relative;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const MessageWrapper = styled.div`
  margin-bottom: ${props => props.$showAvatar ? '16px' : '4px'};
  animation: ${props => props.$isOwnMessage ? slideInRight : slideInLeft} 0.3s ease-out;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    .message-actions {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TypingAvatar = styled(MessageAvatar)`
  width: 28px;
  height: 28px;
  font-size: 12px;
`;

const ChatMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwnMessage ? 'flex-end' : 'flex-start'};
  gap: 4px;
  flex: 1;
  margin-left: ${props => props.$isOwnMessage ? 'auto' : props.$showAvatar ? '0' : '40px'};
  max-width: ${props => props.$isOwnMessage ? '100%' : 'calc(100% - 40px)'};
`;

const MessageBubble = styled.div`
  background: ${props => {
    if (props.$isEmojiOnly) return 'transparent';
    return props.$isOwnMessage 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : '#ffffff';
  }};
  padding: ${props => props.$isEmojiOnly ? '4px' : '12px 16px'};
  border-radius: ${props => {
    if (props.$isEmojiOnly) return '0';
    return props.$isOwnMessage 
      ? '20px 20px 4px 20px' 
      : '20px 20px 20px 4px';
  }};
  max-width: min(400px, 75%);
  box-shadow: ${props => props.$isEmojiOnly ? 'none' : '0 2px 12px rgba(0, 0, 0, 0.08)'};
  border: ${props => {
    if (props.$isEmojiOnly) return 'none';
    return props.$isOwnMessage ? 'none' : '1px solid rgba(0, 0, 0, 0.06)';
  }};
  backdrop-filter: ${props => props.$isEmojiOnly ? 'none' : 'blur(10px)'};
  transition: all 0.2s ease;
  position: relative;
  transform: ${props => props.$isSelected ? 'scale(1.02)' : 'scale(1)'};
  
  &:hover {
    transform: ${props => props.$isEmojiOnly ? 'scale(1.1)' : 'translateY(-1px) scale(1.01)'};
    box-shadow: ${props => props.$isEmojiOnly ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.12)'};
  }
  
  ${props => !props.$isEmojiOnly && `
    &::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      ${props.$isOwnMessage ? `
        right: -8px;
        bottom: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #667eea;
      ` : `
        left: -8px;
        bottom: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid #ffffff;
      `}
    }
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
`;

const Sender = styled.span`
  font-weight: 600;
  color: ${props => props.$isOwnMessage ? 'rgba(255, 255, 255, 0.9)' : '#4a5568'};
  font-size: 13px;
  letter-spacing: 0.3px;
`;

const Message = styled.div`
  word-wrap: break-word;
  line-height: 1.5;
  color: ${props => props.$isOwnMessage ? '#ffffff' : '#2d3748'};
  font-size: ${props => props.$isEmojiOnly ? '32px' : '15px'};
  white-space: pre-wrap;
  text-align: ${props => props.$isEmojiOnly ? 'center' : 'left'};
`;

const MessageLink = styled.a`
  color: ${props => props.$isOwnMessage ? '#e2e8f0' : '#3182ce'};
  text-decoration: underline;
  
  &:hover {
    color: ${props => props.$isOwnMessage ? '#ffffff' : '#2c5282'};
  }
`;

const Timestamp = styled.span`
  font-size: 11px;
  color: ${props => props.$isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : '#a0aec0'};
  font-weight: 500;
  white-space: nowrap;
`;

const EmojiTimestamp = styled.div`
  font-size: 10px;
  color: #a0aec0;
  text-align: center;
  margin-top: 4px;
  font-weight: 500;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  position: absolute;
  top: -16px;
  ${props => props.$isOwnMessage ? 'right: 0;' : 'left: 0;'}
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 10;
  animation: ${scaleIn} 0.2s ease-out;
  
  .message-actions {
    opacity: 1;
    visibility: visible;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f7fafc;
    transform: scale(1.2);
    animation: ${wiggle} 0.5s ease-in-out;
  }
`;

const ReactionsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: ${props => props.$isOwnMessage ? 'flex-end' : 'flex-start'};
`;

const ReactionBadge = styled.button`
  background: ${props => props.$isActive ? '#e2e8f0' : '#f7fafc'};
  border: 1px solid ${props => props.$isActive ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
    transform: scale(1.05);
  }
`;

const SeenIndicator = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
  margin-right: 4px;
`;

const StatusIcon = styled.span`
  font-size: 12px;
  color: ${props => props.$seen ? '#48bb78' : '#a0aec0'};
  transition: color 0.2s ease;
`;

const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0 16px;
`;

const DateBadge = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  letter-spacing: 0.3px;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  animation: ${bounce} 2s infinite;
`;

const EmptyStateText = styled.div`
  color: #4a5568;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyStateSubtext = styled.div`
  color: #a0aec0;
  font-size: 14px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
`;

const TypingIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const TypingBubble = styled.div`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px 20px 20px 4px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #ffffff;
  }
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background: #a0aec0;
  border-radius: 50%;
  animation: ${pulse} 1.4s infinite ease-in-out;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const TypingText = styled.div`
  color: #718096;
  font-size: 13px;
  font-style: italic;
  font-weight: 500;
`;

const ScrollToBottomButton = styled.button`
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  animation: ${scaleIn} 0.3s ease-out;
  
  &:hover {
    background: #764ba2;
    transform: scale(1.1);
  }
`;

const ScrollIcon = styled.span`
  font-size: 20px;
  font-weight: bold;
`;

export default MessageList;