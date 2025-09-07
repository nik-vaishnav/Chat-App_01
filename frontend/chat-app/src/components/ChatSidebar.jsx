import React from 'react';
import styled from 'styled-components';
import { useSocket } from '../contexts/SocketContext';
import UserSearch from './UserSearch';
import OnlineUsersList from './OnlineUsersList';

const ChatSidebar = ({
  currentUser,
  selectedUser,
  onUserSelect,
  onlineUsers = [],         // ✅ explicitly passed from ChatPage
}) => {
  const {
    isConnected,
    unreadCounts = {},
    typingUsers = {},
  } = useSocket(); // ✅ from context

  return (
    <SidebarContainer>
      <SidebarHeader>
        <UserInfo>
          <Avatar src={currentUser.profile_pic || '/default-avatar.png'} alt={currentUser.name} />
          <UserNameContainer>
            <UserName>{currentUser.name}</UserName>
            <ConnectionStatus $isConnected={isConnected}>
              {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
            </ConnectionStatus>
          </UserNameContainer>
        </UserInfo>
      </SidebarHeader>

      <UserSearch onUserSelect={onUserSelect} />

      <OnlineUsersSection>
        <SectionTitle>
          Online Users ({onlineUsers.length > 0 ? onlineUsers.length - 1 : 0})
        </SectionTitle>
        <OnlineUsersList
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          selectedUser={selectedUser}
          onUserSelect={onUserSelect}
          unreadCounts={unreadCounts}
          typingUsers={typingUsers}
        />
      </OnlineUsersSection>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 300px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
`;

const UserNameContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const ConnectionStatus = styled.div`
  font-size: 12px;
  color: ${props => (props.$isConnected ? '#4caf50' : '#ff9800')};
`;

const OnlineUsersSection = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  color: white;
  font-size: 14px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export default ChatSidebar;