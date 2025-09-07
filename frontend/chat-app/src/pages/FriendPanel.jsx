import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import {
  NotificationBanner,
  FriendPanelContainer,
  TabHeader,
  TabButton,
  CountBadge,
  TabContent,
  List,
  ListItem,
  ListItemContent,
  AvatarWrapper,
  Avatar,
  AvatarFallback,
  UserDetails,
  UserName,
  UserEmail,
  Actions,
  ActionButton,
  Loading,
  Message
} from './FriendPanel.styles';

const FriendPanel = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [data, setData] = useState([]);
  const [counts, setCounts] = useState({
    requests: 0,
    sent: 0,
    suggestions: 0,
    friends: 0,
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { socket } = useSocket();
  const token = localStorage.getItem('token');

  const fetchCounts = useCallback(async () => {
    try {
      const [received, sent, suggestions, friends] = await Promise.all([
        axios.get('/api/friends/requests?type=received', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/friends/requests?type=sent', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/friends/suggestions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCounts({
        requests: received.data?.data?.requests?.length || 0,
        sent: sent.data?.data?.requests?.length || 0,
        suggestions: suggestions.data?.data?.length || 0,
        friends: friends.data?.data?.friends?.length || 0,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
      setNotification('Failed to load counts. Please try again later.');
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '';
      if (activeTab === 'requests') url = '/api/friends/requests?type=received';
      else if (activeTab === 'sent') url = '/api/friends/requests?type=sent';
      else if (activeTab === 'suggestions') url = '/api/friends/suggestions';
      else if (activeTab === 'friends') url = '/api/friends';

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let newData = [];
      if (activeTab === 'friends') {
        newData = res.data?.data?.friends || [];
      } else if (activeTab === 'suggestions') {
        newData = Array.isArray(res.data?.data) ? res.data.data : [];
      } else {
        newData = res.data?.data?.requests || [];
      }
      setData(newData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setNotification('Failed to load data. Please try again later.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  const handleAction = async (actionType, id) => {
    try {
      if (actionType === 'accept' || actionType === 'reject') {
        await axios.put(
          `/api/friends/requests/${id}`,
          { action: actionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification(`Request ${actionType}ed successfully.`);
      } else if (actionType === 'cancel') {
        await axios.delete(`/api/friends/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification('Request canceled successfully.');
      } else if (actionType === 'add') {
        await axios.post(
          `/api/friends/requests`,
          { recipientId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification('Friend request sent.');
      } else if (actionType === 'remove') {
        await axios.delete(`/api/friends/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotification('Friend removed.');
      }

      await fetchData();
      await fetchCounts();
    } catch (err) {
      console.error('Action error:', err);
      setNotification('Action failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    const handleRequestReceived = () => {
      if (activeTab === 'requests') fetchData();
      fetchCounts();
    };
    const handleRequestAck = () => {
      if (activeTab === 'sent') fetchData();
      fetchCounts();
    };
    const handleFriendRequestResponded = () => {
      if (['requests', 'friends'].includes(activeTab)) fetchData();
      fetchCounts();
    };

    socket.on('friend_request_received', handleRequestReceived);
    socket.on('friend_request_sent_ack', handleRequestAck);
    socket.on('friend_request_response', handleFriendRequestResponded);

    return () => {
      socket.off('friend_request_received', handleRequestReceived);
      socket.off('friend_request_sent_ack', handleRequestAck);
      socket.off('friend_request_response', handleFriendRequestResponded);
    };
  }, [socket, activeTab, fetchData, fetchCounts]);

  return (
    <>
      {notification && (
        <NotificationBanner
          role="alert"
          tabIndex={0}
          onClick={() => setNotification(null)}
          aria-live="assertive"
          aria-atomic="true"
        >
          {notification}
        </NotificationBanner>
      )}

      <FriendPanelContainer>
        <TabHeader role="tablist" aria-label="Friend panel tabs">
          {['requests', 'sent', 'suggestions', 'friends'].map((tab) => (
<TabButton
  key={tab}
  role="tab"
  aria-selected={activeTab === tab}
  tabIndex={activeTab === tab ? 0 : -1}
  $active={activeTab === tab}
  onClick={() => setActiveTab(tab)}
>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
              {counts[tab] > 0 && <CountBadge aria-label={`${counts[tab]} ${tab}`}>({counts[tab]})</CountBadge>}
            </TabButton>
          ))}
        </TabHeader>

        <TabContent>
          {loading ? (
            <Loading>Loading...</Loading>
          ) : !Array.isArray(data) || data.length === 0 ? (
            <Message>No {activeTab} found</Message>
          ) : (
            <List role="list">
              {data.map((item) => {
                const user =
                  activeTab === 'requests'
                    ? item.sender
                    : activeTab === 'sent'
                      ? item.receiver
                      : item;

                return (
                  <ListItem key={item._id} role="listitem">
                    <ListItemContent>
                      <AvatarWrapper>
                        {user?.profile_pic ? (
                          <Avatar src={user.profile_pic} alt={`${user?.name || 'User'} avatar`} />
                        ) : (
                          <AvatarFallback aria-label="User avatar fallback">
                            {(user?.name || user?.email || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </AvatarWrapper>
                      <UserDetails>
                        <UserName>{user?.username || user?.name || user?.email || 'Unnamed User'}</UserName>
                        <UserEmail>{user?.email || ''}</UserEmail>
                      </UserDetails>
                    </ListItemContent>

                    <Actions>
                      {activeTab === 'requests' && (
                        <>
                          <ActionButton onClick={() => handleAction('add', user?._id)}>Add</ActionButton>
                          <ActionButton danger onClick={() => handleAction('reject', item._id)}>Reject</ActionButton>
                        </>
                      )}
                      {activeTab === 'sent' && (
                        <ActionButton danger onClick={() => handleAction('cancel', item._id)}>Cancel</ActionButton>
                      )}
                      {activeTab === 'suggestions' && (
                        <ActionButton onClick={() => handleAction('add', user._id)}>Add</ActionButton>
                      )}
                      {activeTab === 'friends' && (
                        <ActionButton danger onClick={() => handleAction('remove', user._id)}>Remove</ActionButton>
                      )}
                    </Actions>
                  </ListItem>
                );
              })}
            </List>
          )}
        </TabContent>
      </FriendPanelContainer>
    </>
  );
};

export default FriendPanel;