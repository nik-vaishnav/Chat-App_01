import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/apiServices';

const FriendButton = ({ targetUserId, currentUserId, onStatusChange }) => {
  const [status, setStatus] = useState('none');
  const [reqId, setReqId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // 1. Check friends
        const friendsRes = await apiService.getFriends().catch(() => null);
        if (friendsRes?.data?.friends?.some(f => f._id === targetUserId)) {
          setStatus('friend');
          return;
        }

        // 2. Check sent requests
        const sentRes = await apiService.getFriendRequests('sent').catch(() => null);
        const sent = sentRes?.data?.requests?.find(
          r => r.receiver._id === targetUserId || r.receiver === targetUserId
        );
        if (sent) {
          setStatus('sent');
          setReqId(sent._id);
          return;
        }

        // 3. Check received requests
        const recRes = await apiService.getFriendRequests('received').catch(() => null);
        const rec = recRes?.data?.requests?.find(
          r => r.sender._id === targetUserId || r.sender === targetUserId
        );
        if (rec) {
          setStatus('received');
          setReqId(rec._id);
          return;
        }

        setStatus('none');
      } catch (error) {
        console.error('Error fetching friend status:', error);
        setStatus('none');
      }
    };

    if (targetUserId) {
      fetchStatus();
    }
  }, [targetUserId]);

  const exec = async (action) => {
    if (!targetUserId) {
      console.error('No targetUserId provided');
      return;
    }

    setBusy(true);
    try {
      if (action === 'send') {
        console.log('📤 Sending friend request to:', targetUserId);
        const res = await apiService.sendFriendRequest(targetUserId);

        console.log('📥 Server response:', res);

        if (res?.success) {
          setStatus('sent');
          setReqId(res.data._id);
          onStatusChange?.();
        } else {
          alert(res?.message || 'Failed to send request');
        }

      } else if (['accept', 'reject'].includes(action)) {
        if (!reqId) {
          console.error('No request ID for', action);
          return;
        }

        console.log(`📤 ${action.toUpperCase()} friend request with ID:`, reqId);
        const res = await apiService.respondToFriendRequest(reqId, action);
        console.log('📥 Response:', res);

        if (res?.success) {
          setStatus(action === 'accept' ? 'friend' : 'none');
          onStatusChange?.();
        } else {
          alert(res?.message || `Failed to ${action} request`);
        }
      }
    } catch (err) {
      console.error(`❌ Error executing ${action}:`, err);
      alert(`Error while trying to ${action} request`);
    } finally {
      setBusy(false);
    }
  };

  // UI Conditions
if (!targetUserId) return null;

switch (status) {
  case 'friend':
    return <StyledLabel>✔ Friend</StyledLabel>;

  case 'sent':
    return <StyledLabel>⏳ Pending</StyledLabel>;

  case 'received':
    return (
      <ButtonGroup>
        <ActionButton disabled={busy} onClick={() => exec('accept')}>
          Accept
        </ActionButton>
        <ActionButton danger disabled={busy} onClick={() => exec('reject')}>
          Reject
        </ActionButton>
      </ButtonGroup>
    );

  default:
    return (
      <ActionButton disabled={busy} onClick={() => exec('send')}>
        Add Friend
      </ActionButton>
    );
}
}
export default FriendButton;


// Styled Components
const ActionButton = styled.button`
  margin-left: 4px;
  background: ${p => p.danger ? '#e74c3c' : '#8e44ad'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 4px 10px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  font-size: 12px;

  &:hover {
    background: ${p => p.danger ? '#c0392b' : '#9b59b6'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const StyledLabel = styled.span`
  margin-left: 8px;
  color: #ddd;
  font-style: italic;
  font-size: 12px;
`;

