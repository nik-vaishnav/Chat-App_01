import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';

import {
  Card as ProfileContainer,
  Title as Heading,
  Spinner as LoadingSpinner,
  Avatar as ProfileImage,
  AvatarWrap as ProfileImageContainer,
  Hint as ImageHint,
  Banner as ErrorBanner,
  Note as Message,
  InfoGroup as DetailsContainer,
  Info as Detail,
  Label as DetailLabel,
  Value as DetailValue,
  Status as StatusIndicator,
  Form as EditForm,
  Group as FormGroup,
  Field as Input,
  Area as TextArea,
  Count as CharCount,
  Actions as ButtonGroup,
  Save as SaveButton,
  Cancel as CancelButton,
  Edit as EditButton,
  Pencil as EditIcon,
  ErrorBox as ErrorMessage,
  Icon as ErrorIcon,
  Retry as RetryButton
} from './profileStyles';

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [formData, setFormData] = useState({ name: '', profile_pic: '', bio: '' });
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [file, setFile] = useState(null);


  const navigate = useNavigate();
  const socket = useSocket();
  const {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    getProfile,
    updateUser,
    clearError
  } = useUser();

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Memoized form validation
  const formValidation = useMemo(() => {
    const errors = {};
    if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    if (formData.name.trim().length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    if (formData.profile_pic && !isValidUrl(formData.profile_pic)) {
      errors.profile_pic = 'Please enter a valid image URL';
    }
    if (formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }
    return errors;
  }, [formData]);

  const isFormValid = Object.keys(formValidation).length === 0;

  // URL validation helper

  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated) return navigate('/login');

    try {
      setProfileError(null);
      const result = await getProfile();
      if (result?.success) {
        const userData = {
          name: result.data.name || '',
          profile_pic: result.data.profile_pic || '',
          bio: result.data.bio || ''
        };
        setFormData(userData);
        setImageError(false);
      } else {
        setProfileError(result?.error || 'Unknown error occurred.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfileError('Failed to fetch user profile.');
    }
  }, [isAuthenticated, getProfile, navigate]);

  useEffect(() => {
    if (!isLoading) {
      clearError();
      if (isAuthenticated) {
        fetchUserProfile();
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, fetchUserProfile, clearError, navigate]);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function' || !currentUser) return;

    const handleStatusChange = ({ userId, isOnline }) => {
      if (userId === currentUser.id || userId === currentUser._id) {
        updateUser({ ...currentUser, isOnline });
      }
    };

    const handleReconnect = () => {
      fetchUserProfile();
    };

    socket.on('friend_status_changed', handleStatusChange);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('friend_status_changed', handleStatusChange);
      socket.off('connect', handleReconnect);
    };
  }, [socket, currentUser, updateUser, fetchUserProfile]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field errors when user starts typing
    if (profileError && profileError.includes(name)) {
      setProfileError(null);
    }
  }, [profileError]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback((e) => {
    setImageLoading(false);
    setImageError(true);
    e.target.src = '/default-avatar.png';
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setProfileError('Please fix the form errors before submitting.');
      return;
    }

    try {
      setUpdating(true);
      setProfileError(null);
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare clean form data
      const cleanFormData = {
        name: formData.name.trim(),
        profile_pic: formData.profile_pic.trim(),
        bio: formData.bio.trim()
      };

      console.log('Submitting formData:', cleanFormData);

      // Send updated data to server
let res;

if (file) {
  const formDataToSend = new FormData();
  formDataToSend.append('name', cleanFormData.name);
  formDataToSend.append('bio', cleanFormData.bio);
  formDataToSend.append('profile_pic', file); // multer expects this key

  res = await fetch('http://localhost:8080/api/users/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}` // No content-type for FormData
    },
    body: formDataToSend
  });
} else {
  res = await fetch('http://localhost:8080/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(cleanFormData)
  });
}

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      // Fetch updated profile from server
      const profileRes = await fetch('http://localhost:8080/api/users/profile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!profileRes.ok) {
        throw new Error('Failed to fetch updated profile');
      }

      const profileData = await profileRes.json();
      if (!profileData.data) {
        throw new Error('Invalid profile data received');
      }

      // Update context and localStorage
      updateUser(profileData.data);
      localStorage.setItem('currentUser', JSON.stringify(profileData.data));
      if (profileData.data.name) {
        localStorage.setItem('name', profileData.data.name);
      }

      setEditing(false);
      setSuccessMessage('Profile updated successfully!');

      // Trigger image reload if URL changed
      if (cleanFormData.profile_pic !== currentUser?.profile_pic) {
        setImageLoading(true);
      }

    } catch (err) {
      console.error('Update error:', err);
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = useCallback(() => {
    setFormData({
      name: currentUser?.name || '',
      profile_pic: currentUser?.profile_pic || '',
      bio: currentUser?.bio || ''
    });
    setEditing(false);
    setProfileError(null);
    setSuccessMessage('');
    clearError();
  }, [currentUser, clearError]);

  const handleRetry = useCallback(() => {
    clearError();
    setProfileError(null);
    setSuccessMessage('');
    fetchUserProfile();
  }, [clearError, fetchUserProfile]);

  const handleEditClick = useCallback(() => {
    setEditing(true);
    setProfileError(null);
    setSuccessMessage('');
  }, []);

  // Format member since date
  const memberSinceDate = useMemo(() => {
    if (!currentUser?.createdAt) return 'N/A';

    try {
      return new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }, [currentUser?.createdAt]);

  // Show loading spinner while fetching initial data
  if (isLoading) {
    return (
      <ProfilePageWrapper>
        <OrbBackground />
        <Navbar />
        <ContentCenter>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading your profile...</LoadingText>
          </LoadingContainer>
        </ContentCenter>
      </ProfilePageWrapper>
    );
  }

  return (
    <ProfilePageWrapper>
      <OrbBackground />
      <Navbar />
      <ContentCenter>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ProfileContainer className="flex flex-col sm:flex-row gap-8 w-full max-w-6xl p-10 sm:p-12 rounded-3xl">
            {/* Left Section */}
            <div className="w-full sm:w-1/3 flex flex-col items-center">
              <Heading>User Profile</Heading>
              <ProfileImageContainer>
                <ProfileImageWrapper>
                  {imageLoading && <ImageLoadingOverlay />}
                  <ProfileImage
                    src={currentUser?.profile_pic || '/default-avatar.png'}
                    alt={`${currentUser?.name || 'User'}'s profile`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    $hasError={imageError}
                  />
                  {imageError && <ImageErrorOverlay>Failed to load image</ImageErrorOverlay>}
                </ProfileImageWrapper>
                {editing && (
                  <ImageHint>
                    Enter a valid image URL or choose a file to update your profile picture
                  </ImageHint>
                )}
              </ProfileImageContainer>
            </div>

            {/* Right Section */}
            <div className="w-full sm:w-2/3">
              <AnimatePresence mode="wait">
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SuccessBanner>{successMessage}</SuccessBanner>
                  </motion.div>
                )}
              </AnimatePresence>

              {(error || profileError) && (
                <ErrorBanner>
                  {error || profileError}
                  <RetryButton onClick={handleRetry} type="button">
                    Try Again
                  </RetryButton>
                </ErrorBanner>
              )}

              {editing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <EditForm onSubmit={handleUpdateProfile}>
                    <FormGroup>
                      <DetailLabel>Name:</DetailLabel>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                        placeholder="Enter your name"
                        $hasError={!!formValidation.name}
                      />
                      {formValidation.name && (
                        <ValidationError>{formValidation.name}</ValidationError>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <DetailLabel>Profile Picture URL:</DetailLabel>
                      <Input
                        type="url"
                        name="profile_pic"
                        value={formData.profile_pic}
                        onChange={handleInputChange}
                        placeholder="Enter image URL (optional)"
                        $hasError={!!formValidation.profile_pic}
                      />
                      {formValidation.profile_pic && (
                        <ValidationError>{formValidation.profile_pic}</ValidationError>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <DetailLabel>Or Upload Image File:</DetailLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </FormGroup>

                    <FormGroup>
                      <DetailLabel>Bio:</DetailLabel>
                      <TextArea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself (optional)"
                        maxLength={500}
                        rows={4}
                        $hasError={!!formValidation.bio}
                      />
                      <CharCount $overLimit={formData.bio.length > 500}>
                        {formData.bio.length}/500 characters
                      </CharCount>
                      {formValidation.bio && (
                        <ValidationError>{formValidation.bio}</ValidationError>
                      )}
                    </FormGroup>

                    <ButtonGroup>
                      <SaveButton
                        type="submit"
                        disabled={updating || !isFormValid}
                        $loading={updating}
                      >
                        {updating ? (
                          <>
                            <ButtonSpinner />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </SaveButton>
                      <CancelButton
                        type="button"
                        onClick={handleCancel}
                        disabled={updating}
                      >
                        Cancel
                      </CancelButton>
                    </ButtonGroup>
                  </EditForm>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <DetailsContainer>
                    <Detail>
                      <DetailLabel>Name:</DetailLabel>
                      <DetailValue>{currentUser?.name || 'Not set'}</DetailValue>
                    </Detail>
                    <Detail>
                      <DetailLabel>Email:</DetailLabel>
                      <DetailValue>{currentUser?.email || 'Not available'}</DetailValue>
                    </Detail>
                    {currentUser?.bio && (
                      <Detail>
                        <DetailLabel>Bio:</DetailLabel>
                        <DetailValue>{currentUser.bio}</DetailValue>
                      </Detail>
                    )}
                    <Detail>
                      <DetailLabel>Member since:</DetailLabel>
                      <DetailValue>{memberSinceDate}</DetailValue>
                    </Detail>
                    <Detail>
                      <DetailLabel>Status:</DetailLabel>
                      <DetailValue>
                        <StatusIndicator $online={currentUser?.isOnline !== false}>
                          {currentUser?.isOnline !== false ? '🟢 Online' : '🔴 Offline'}
                        </StatusIndicator>
                      </DetailValue>
                    </Detail>
                  </DetailsContainer>
                  <EditButton onClick={handleEditClick}>
                    <EditIcon>✏️</EditIcon>
                    Edit Profile
                  </EditButton>
                </motion.div>
              )}
            </div>
          </ProfileContainer>
        </motion.div>
      </ContentCenter>
    </ProfilePageWrapper>
  );
};

export default ProfilePage;

// Styled Components
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
  100% { transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ProfilePageWrapper = styled.div`
  position: relative;
  background: linear-gradient(to bottom, #ab47bc, #6a1b9a);
  min-height: 100vh;
  overflow: hidden;
`;

const ContentCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 60px 20px;
`;

const OrbBackground = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    animation: ${float} 10s ease-in-out infinite;
  }

  &::before {
    top: 50px;
    left: 15%;
  }

  &::after {
    bottom: 100px;
    right: 15%;
    animation-delay: 2s;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
`;

const LoadingText = styled.p`
  color: white;
  font-size: 18px;
  font-weight: 500;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ImageLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
  }
`;

const ImageErrorOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #ff6b6b;
  text-align: center;
  padding: 8px;
  z-index: 1;
`;

const SuccessBanner = styled.div`
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ValidationError = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 4px;
  font-weight: 500;
`;

const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
`;