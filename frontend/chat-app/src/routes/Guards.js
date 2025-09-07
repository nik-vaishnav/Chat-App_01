import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const LoadingScreen = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: 'linear-gradient(135deg, #6a1b9a, #ab47bc)',
    color: 'white', fontSize: '18px', fontFamily: 'Poppins, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white', borderRadius: '50%',
        animation: 'spin 1s linear infinite', margin: '0 auto 20px'
      }} />
      <p>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return children;
};

export const LogoutPage = () => {
  const { logout } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.clear();
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    };

    performLogout();
  }, [logout]);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'linear-gradient(135deg, #6a1b9a, #ab47bc)',
      color: 'white', fontSize: '24px', fontFamily: 'Poppins, sans-serif'
    }}>
      <div>
        <h2>Logging you out...</h2>
        <p style={{ opacity: 0.8 }}>Please wait while we sign you out securely.</p>
        <div style={{
          margin: '30px auto', width: '40px', height: '40px',
          border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white',
          borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};