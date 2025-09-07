import React, { useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/apiServices';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6a1b9a, #8e24aa);
  color: #fff;
  font-family: 'Arial', sans-serif;
  padding: 20px;
`;

const FormWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: #333;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
color: var(--accent-color);
  text-align: center;
  font-size: 24px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);

    box-shadow: 0 0 0 2px rgba(106, 27, 154, 0.1);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  background: #6a1b9a;
  color: #fff;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  transition: background-color 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #8e24aa;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #38a169;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
`;

const Link = styled.span`
color: var(--accent-color);
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #8e24aa;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.signUp(formData);
      setSuccess(response.message || 'Sign-up successful! You can now log in.');
      setError('');
      
      // Reset form after successful signup
      setFormData({
        name: '',
        email: '',
        password: '',
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'An error occurred during sign-up. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Sign Up</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
            minLength="6"
          />
          <Button type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <LinkText>
          Already have an account?{' '}
          <Link onClick={handleLoginRedirect}>
            Log in here
          </Link>
        </LinkText>
      </FormWrapper>
    </Container>
  );
};

export default SignUpPage;