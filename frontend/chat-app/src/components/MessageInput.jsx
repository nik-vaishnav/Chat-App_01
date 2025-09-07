import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import EmojiPicker from 'emoji-picker-react'; // 👈 NEW
import { useSocket } from '../contexts/SocketContext';
import { getId } from '../utils/utils';

const MessageInput = ({ onSendMessage, selectedUser, disabled = false }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 👈 NEW

  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null); // 👈 NEW
  const { emitTyping, currentConversation, isConnected } = useSocket();

  useEffect(() => {
    return () => typingTimeoutRef.current && clearTimeout(typingTimeoutRef.current);
  }, []);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (currentConversation && isConnected && !isTyping) {
      setIsTyping(true);
      emitTyping(getId(currentConversation), true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentConversation && isConnected) {
        emitTyping(getId(currentConversation), false);
      }
    }, 1000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || disabled) return;
    onSendMessage(newMessage.trim());
    setNewMessage("");
    setIsTyping(false);
    setShowEmojiPicker(false);
    inputRef.current?.focus();

    if (currentConversation && isConnected) {
      emitTyping(getId(currentConversation), false);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const isDisabled = disabled || !isConnected;

  return (
    <InputWrapper>
      {showEmojiPicker && (
        <EmojiPickerContainer>
          <EmojiPicker onEmojiClick={onEmojiClick} height={350} />
        </EmojiPickerContainer>
      )}

      <InputContainer>
        <EmojiToggleButton
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Toggle Emoji Picker"
        >
          😊
        </EmojiToggleButton>

        <ChatInput
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={
            isDisabled ? "Connecting..." : `Message ${selectedUser?.name || ''}...`
          }
          disabled={isDisabled}
          ref={inputRef}
        />

        <SendButton
          onClick={handleSendMessage}
          disabled={isDisabled || !newMessage.trim()}
        >
          Send
        </SendButton>
      </InputContainer>
    </InputWrapper>
  );
};

// Styled Components

const InputWrapper = styled.div`
  position: relative;
  background: white;
  border-top: 1px solid #e0e0e0;
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 80px;
  left: 20px;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  background-color: ${props => props.disabled ? '#f5f5f5' : 'white'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &:focus {
    border-color: ${props => props.disabled ? '#e0e0e0' : '#6a1b9a'};
  }

  &:disabled {
    color: #999;
  }
`;

const SendButton = styled.button`
  background-color: ${props => props.disabled ? '#bdc3c7' : '#6a1b9a'};
  color: #fff;
  padding: 15px 25px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-width: 80px;

  &:hover {
    background-color: ${props => props.disabled ? '#bdc3c7' : '#7b1fa2'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const EmojiToggleButton = styled.button`
  background: transparent;
  border: none;
  font-size: 22px;
  margin-right: -8px;
  margin-left: -5px;
  cursor: pointer;
`;

export default MessageInput;