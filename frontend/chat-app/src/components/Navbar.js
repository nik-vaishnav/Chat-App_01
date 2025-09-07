import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../contexts/UserContext';
import { PreferencesContext } from '../contexts/PreferencesContext';

const Navbar = () => {
  const { name, logout } = useContext(UserContext);
  const { preferences, updatePreferences } = useContext(PreferencesContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ ...preferences, theme: newTheme });
  };

  return (
    <Nav>
      <Left>
        <Logo>
          <span className="english">Samvad</span>
          <span className="marathi">संवाद</span>
        </Logo>
      </Left>

      <NavList>
        <NavItem>
          <StyledNavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </StyledNavLink>
        </NavItem>

        {name ? (
          <>
            <NavItem><StyledNavLink to="/chat">Chat</StyledNavLink></NavItem>
            <NavItem><StyledNavLink to="/friends">Friends</StyledNavLink></NavItem>
            <NavItem><StyledNavLink to="/profile">Profile</StyledNavLink></NavItem>
            <NavItem><StyledNavLink to="/settings">Settings</StyledNavLink></NavItem>
            <NavItem><StyledNavLink to="/about">About</StyledNavLink></NavItem>
            <NavItem><LogoutButton onClick={handleLogout}>Logout</LogoutButton></NavItem>
          </>
        ) : (
          <>
            <NavItem><StyledNavLink to="/about">About</StyledNavLink></NavItem>
            <NavItem><StyledNavLink to="/login">Login</StyledNavLink></NavItem>
            <NavItem><SignUpButton onClick={() => navigate('/signup')}>Sign Up</SignUpButton></NavItem>
          </>
        )}

        <NavItem>
          <ThemeToggle onClick={toggleTheme}>
            {preferences.theme === 'dark' ? '☀️' : '🌙'}
          </ThemeToggle>
        </NavItem>
      </NavList>

      {name && (
        <WelcomeMessage>
          Welcome, {name}!
        </WelcomeMessage>
      )}
    </Nav>
  );
};

export default Navbar;

// Styled Components
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--card-bg);
  padding: 15px 20px;
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .english {
    font-family: "Poppins", sans-serif;
    font-weight: bold;
    font-size: 28px;
    color: var(--text-color);
    letter-spacing: 2px;
  }

  .marathi {
    font-family: "Lohit Devanagari", sans-serif;
    font-size: 24px;
    color: #FF6F00;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  gap: 10px;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavItem = styled.li``;

const StyledNavLink = styled(NavLink)`
  color: var(--text-color);
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &.active {
    background-color: var(--accent-color);
    color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:hover {
    background-color: rgba(0,0,0,0.05);
    transform: translateY(-1px);
  }
`;

const SignUpButton = styled.button`
  background-color: #FF8F00;
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #FFA726;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  }
`;

const LogoutButton = styled(SignUpButton)`
  background-color: #e53935;

  &:hover {
    background-color: #c62828;
  }
`;

const ThemeToggle = styled.button`
  background-color: transparent;
  color: var(--text-color);
  font-size: 18px;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 2px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: var(--accent-color);
    color: white;
  }
`;

const WelcomeMessage = styled.div`
  font-weight: 600;
  font-size: 15px;
  padding: 8px 14px;
  background-color: rgba(255,255,255,0.2);
  border-radius: 20px;
  color: var(--text-color);
`;
