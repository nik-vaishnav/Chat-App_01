// SecurityCard.js
import React, { useState } from 'react';
import styled from 'styled-components';

const SecurityCard = ({ onUpdatePassword, onUpdateEmail }) => {
  const [passwordData, setPasswordData] = useState({
    current: '', newPass: '', confirm: ''
  });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirm) {
      return setMsg({ type: 'error', text: 'Passwords do not match' });
    }
    if (passwordData.newPass.length < 6) {
      return setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
    }

    setLoading(true);
    try {
      await onUpdatePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.newPass,
      });
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      return setMsg({ type: 'error', text: 'Invalid email address' });
    }

    setLoading(true);
    try {
      await onUpdateEmail(email);
      setMsg({ type: 'success', text: 'Email updated successfully' });
      setEmail('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>Security</Title>
      {msg.text && (
        <Feedback type={msg.type}>{msg.text}</Feedback>
      )}

      <Form onSubmit={handlePasswordChange}>
        <SubTitle>Change Password</SubTitle>
        <Input
          type="password"
          placeholder="Current Password"
          value={passwordData.current}
          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
        />
        <Input
          type="password"
          placeholder="New Password"
          value={passwordData.newPass}
          onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={passwordData.confirm}
          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </Form>

      <Form onSubmit={handleEmailChange}>
        <SubTitle>Update Email</SubTitle>
        <Input
          type="email"
          placeholder="New Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Email'}
        </Button>
      </Form>
    </Card>
  );
};

export default SecurityCard;
const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 26px;
color: var(--accent-color);

  margin-bottom: 20px;
  font-weight: 700;
`;

const SubTitle = styled.h4`
  font-size: 18px;
  margin: 20px 0 10px;
  color: #444;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;

  &:focus {
    border-color: var(--accent-color);
    outline: none;
  }
`;

const Button = styled.button`
  background-color: var(--accent-color);
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #8e24aa;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Feedback = styled.div`
  background-color: ${({ type }) => (type === 'error' ? '#e53935' : '#43a047')};
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 15px;
`;
