import React, { useEffect } from 'react';
import styled from 'styled-components';

const OnlineUsersList = ({
  onlineUsers,
  currentUser,
  selectedUser,
  onUserSelect,
  unreadCounts = {},
  typingUsers = {},
}) => {
  const currentId = currentUser?.id || currentUser?._id;

  // ✅ Log only once when onlineUsers becomes empty or undefined
  useEffect(() => {
    if (!onlineUsers || onlineUsers.length === 0) {
      console.warn('🚨 onlineUsers is empty or undefined:', onlineUsers);
    }
  }, [onlineUsers]);

  if (!onlineUsers || onlineUsers.length === 0) {
    return <EmptyMessage>No users online</EmptyMessage>;
  }

  // ✅ Filter out the current user
  const filteredUsers = onlineUsers.filter(u => u.userId !== currentId);

  if (filteredUsers.length === 0) {
    console.log('ℹ️ No users after filtering current user:', currentId);
    return <EmptyMessage>No users online</EmptyMessage>;
  }

  console.log('✅ onlineUsers received:', onlineUsers);
  console.log('👤 currentUser ID:', currentId);

  return (
    <UserList>
      {filteredUsers.map(user => {
        const isTyping = Object.values(typingUsers).some(userIds =>
          userIds.includes(user.userId)
        );

        return (
          <UserItem
            key={user.userId}
            $isActive={selectedUser?.userId === user.userId}
            onClick={() => onUserSelect(user)}
            title={user.name}
          >
            <Avatar src={user.profile_pic || '/default-avatar.png'} alt={user.name} />
            <UserInfo>
              <UserName>
                {isTyping ? (
                  <TypingText>typing...</TypingText>
                ) : (
                  user.name || user.username || user.email || 'Unnamed User'
                )}
              </UserName>
              {unreadCounts[user.userId] > 0 && (
                <UnreadBadge>{unreadCounts[user.userId]}</UnreadBadge>
              )}
            </UserInfo>
            <StatusDot $Sstatus={user.isOnline ? 'online' : 'offline'} />
          </UserItem>
        );
      })}
    </UserList>
  );
};

// Styled Components

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: ${({ $isActive }) => ($isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const UserName = styled.span`
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TypingText = styled.span`
  font-style: italic;
  color: #00e0ff;
`;

const StatusDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'online':
        return '#4caf50';
      case 'away':
        return '#ff9800';
      case 'busy':
        return '#f44336';
      default:
        return '#999';
    }
  }};
  flex-shrink: 0;
`;

const UnreadBadge = styled.div`
  background-color: #ff3b3b;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 12px;
  align-self: flex-start;
  margin-top: 4px;
  width: fit-content;
`;

const EmptyMessage = styled.div`
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-top: 40px;
`;

export default OnlineUsersList;