import React from 'react';
import styled from 'styled-components';
import { useSocket } from '../contexts/SocketContext';
import { getId } from '../utils/utils';

const ChatHeader = ({ selectedUser, onFriendRemoved }) => {
  const { onlineUsers } = useSocket();
  const isUserOnline = onlineUsers.find(u => u.userId === getId(selectedUser));

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to remove ${selectedUser.name} from your friends?`)) {
      return;
    }

    try {
      const friendId = getId(selectedUser);
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Friend removed successfully');
        if (onFriendRemoved) onFriendRemoved(friendId);
      } else {
        alert(data.message || 'Failed to remove friend');
      }
    } catch (error) {
      alert('Error removing friend, please try again.');
      console.error(error);
    }
  };

  return (
    <HeaderContainer>
      <SelectedUserInfo>
        <Avatar src={selectedUser.profile_pic || '/default-avatar.png'} alt={selectedUser.name} />
        <SelectedUserDetails>
          <SelectedUserName>{selectedUser.name}</SelectedUserName>
          <UserStatus>{isUserOnline ? 'Online' : 'Offline'}</UserStatus>
          <RemoveFriendButton onClick={handleRemoveFriend}>
            Remove Friend
          </RemoveFriendButton>
        </SelectedUserDetails>
      </SelectedUserInfo>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
`;

const SelectedUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SelectedUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectedUserName = styled.h2`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const UserStatus = styled.div`
  font-size: 14px;
  color: #666;
`;

const RemoveFriendButton = styled.button`
  margin-top: 8px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d32f2f;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

export default ChatHeader;