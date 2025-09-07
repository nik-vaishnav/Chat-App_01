import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';

import Navbar from '../components/Navbar';
import SecurityCard from '../components/Settings/SecurityCard';
import PreferencesCard from '../components/Settings/PreferencesCard';
import ProfileImageUpload from '../components/Settings/ProfileImageUpload';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { name, profile_pic } = useContext(UserContext);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfileImage = async () => {
    if (!profileImageFile) return;
    try {
      const formData = new FormData();
      formData.append('profile_pic', profileImageFile);

      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage('Profile image updated successfully');
      setError('');
    } catch (err) {
      setMessage('');
      setError('Failed to upload profile picture');
    }
  };

  const handleUpdatePassword = async ({ currentPassword, newPassword }) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Password update failed');
    }
  };

  const handleUpdateEmail = async (newEmail) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-email`,
        { newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Email update failed');
    }
  };

  return (
    <PageContainer>
      <Navbar />

      <SettingsSection>
        <SectionHeader>
          <h1>Account Settings</h1>
          <p>Manage your profile, security and preferences</p>
        </SectionHeader>

        {message && <SuccessMessage>{message}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Grid>
          <Column>
            <ProfileImageUpload
              currentImage={profile_pic}
              onImageChange={(file) => setProfileImageFile(file)}
            />
            <SaveImageButton onClick={handleSaveProfileImage}>
              Save Profile Image
            </SaveImageButton>
          </Column>

          <Column>
            <SecurityCard
              onUpdatePassword={handleUpdatePassword}
              onUpdateEmail={handleUpdateEmail}
            />
          </Column>

          <Column>
            <PreferencesCard />
          </Column>
        </Grid>
      </SettingsSection>
    </PageContainer>
  );
};

export default SettingsPage;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const SettingsSection = styled.section`
  padding: 40px 20px;
  background: linear-gradient(to right, var(--accent-color), #ab47bc);
  color: #fff;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 2.5rem;
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 30px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  justify-content: center;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`;

const SaveImageButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  margin-top: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: #aa2ec2;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  }
`;

const SuccessMessage = styled.div`
  background-color: #4caf50;
  color: white;
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  background-color: #f44336;
  color: white;
  padding: 12px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
`;