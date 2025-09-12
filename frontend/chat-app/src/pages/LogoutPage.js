// LogoutPage.js
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../contexts/UserContext'; // corrected path
import { apiService } from '../services/apiServices';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext);
  const [loggingOut, setLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await apiService.logout(token);
        }
      } catch (error) {
        console.error('Logout API failed:', error);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('currentUser');
        logout(); // Clear context
        setLoggingOut(false);
        setTimeout(() => navigate('/'), 1000); // delay to show message
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <LogoutContainer>
      <LogoutMessage>
        {loggingOut ? (
          <>
            <Spinner /> Logging you out...
          </>
        ) : (
          <>You are now logged out</>
        )}
      </LogoutMessage>
    </LogoutContainer>
  );
};

export default LogoutPage;

const LogoutContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a1b9a, #ab47bc);
  padding: 1rem;
  text-align: center;
`;

const LogoutMessage = styled.h2`
  color: white;
  font-size: 22px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
