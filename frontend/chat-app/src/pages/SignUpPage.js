import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { apiService } from '../services/apiServices';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- styled-components (same as your version) ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4a148c, #8e24aa);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
`;

const FormWrapper = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  color: #333;
  width: 100%;
  max-width: 420px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #6a1b9a;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
`;

const InputGroup = styled.div`
  position: relative;
  margin: 12px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ hasError }) => (hasError ? '#e53e3e' : '#ccc')};
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? '#e53e3e' : '#6a1b9a')};
    box-shadow: 0 0 0 3px
      ${({ hasError }) =>
        hasError ? 'rgba(229, 62, 62, 0.15)' : 'rgba(106, 27, 154, 0.15)'};
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TogglePassword = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 14px;
  color: #6a1b9a;

  &:hover {
    color: #8e24aa;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #6a1b9a, #8e24aa);
  color: #fff;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 18px;
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(106, 27, 154, 0.35);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 13px;
  margin-top: 6px;
  text-align: left;
  animation: ${fadeIn} 0.3s ease;
`;

const SuccessMessage = styled.p`
  color: #38a169;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #555;
  font-size: 14px;
`;

const Link = styled.span`
  color: #6a1b9a;
  cursor: pointer;
  font-weight: 500;
  text-decoration: underline;

  &:hover {
    color: #8e24aa;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.9s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Enter a valid email';
        break;
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'At least 6 characters required';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: validateField(name, value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setSuccess('');

    try {
      const response = await apiService.signUp(formData);
      setSuccess(response.message || 'Sign-up successful! Redirecting...');
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setFormErrors({ general: err.message || 'Sign-up failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormWrapper
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Create Account</Title>
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              hasError={!!formErrors.name}
            />
            {formErrors.name && <ErrorMessage>{formErrors.name}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              hasError={!!formErrors.email}
            />
            {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              hasError={!!formErrors.password}
            />
            <TogglePassword onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁️'}
            </TogglePassword>
            {formErrors.password && (
              <ErrorMessage>{formErrors.password}</ErrorMessage>
            )}
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading && <LoadingSpinner />}
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <AnimatePresence>
          {formErrors.general && <ErrorMessage>{formErrors.general}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </AnimatePresence>

        <LinkText>
          Already have an account?{' '}
          <Link onClick={() => navigate('/login')}>Log in here</Link>
        </LinkText>
      </FormWrapper>
    </Container>
  );
};

export default SignUpPage;
