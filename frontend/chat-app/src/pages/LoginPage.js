import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../contexts/UserContext';
import { apiService } from '../services/apiServices';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(UserContext);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await apiService.validateToken();

        if (response.success && response.user) {
          localStorage.setItem('name', response.user.name);
          localStorage.setItem('currentUser', JSON.stringify(response.user));

          dispatch({
            type: 'SET_USER',
            payload: { user: response.user, token }
          });

          navigate('/chat', {
            state: {
              user: {
                name: response.user.name,
                email: response.user.email,
                id: response.user.id,
              },
            },
          });
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('currentUser');
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    };

    validateToken();
  }, [navigate, dispatch]);

const handleLogin = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setError('');

  try {
    const response = await apiService.login({ email, password });

    // ✅ unwrap properly
    const { user, token } = response.data || {};

    if (!user || !token) throw new Error('Invalid login response from server.');

    dispatch({ type: 'SET_USER', payload: { user, token } });
    localStorage.setItem('token', token);
    localStorage.setItem('name', user.name);
    localStorage.setItem('currentUser', JSON.stringify(user));

    navigate('/chat', {
      replace: true,
      state: {
        user: {
          name: user.name,
          email: user.email,
          id: user.id,
        },
      },
    });
  } catch (err) {
    setError(err.response?.data?.message || err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  const validateForm = () => {
    if (!email.trim()) return setError('Email is required') || false;
    if (!password.trim()) return setError('Password is required') || false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Invalid email') || false;
    if (password.length < 6) return setError('Password too short') || false;
    return true;
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Logo>संवाद</Logo>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to continue chatting</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <LoginForm onSubmit={handleLogin} noValidate>
          {/* Email Field */}
          <InputGroup>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
          </InputGroup>

          {/* Password Field */}
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />
            <EyeButton
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </EyeButton>
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </LoginForm>

        <LinksContainer>
          <LinkText><Link onClick={() => navigate('/forgot-password')}>Forgot Password?</Link></LinkText>
          <LinkText>Don't have an account? <Link onClick={() => navigate('/signup')}>Sign Up</Link></LinkText>
          <LinkText><Link onClick={() => navigate('/')}>← Back to Home</Link></LinkText>
        </LinksContainer>
      </LoginBox>
    </LoginContainer>
  );
};

export default LoginPage;

/* ---------------- Styled Components ---------------- */

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: radial-gradient(circle at top left, #a29bfe, #6c5ce7);
  background-attachment: fixed;
`;

const LoginBox = styled.div`
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.4s ease-in-out both;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
    border-radius: 14px;
  }
`;

const Logo = styled.div`
  font-size: 2.4rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  color: #6a1b9a;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1px;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.4rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  text-align: center;
  color: #666;
  margin-bottom: 1.6rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffe6e6;
  color: #d63031;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* Shared wrapper for both email & password */
const InputGroup = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 16px;
  font-size: 1rem;
  border: none;
  outline: none;

  &:disabled {
    background: #f1f1f1;
  }
`;

const EyeButton = styled.button`
  background: none;
  border: none;
  padding: 0 12px;
  cursor: pointer;
  color: #555;
  font-size: 18px;

  &:disabled {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #00cec9, #6c5ce7);
  color: white;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover:not(:disabled) {
    background: linear-gradient(to right, #81ecec, #a29bfe);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin-right: 10px;
`;

const LinksContainer = styled.div`
  text-align: center;
  margin-top: 1.8rem;
`;

const LinkText = styled.div`
  margin: 0.4rem 0;
  font-size: 0.95rem;
`;

const Link = styled.span`
  color: #6c5ce7;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #341f97;
  }
`;
