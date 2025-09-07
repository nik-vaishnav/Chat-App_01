import styled, { keyframes, css } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Main Container
export const FriendPanelContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #fff;
  background: linear-gradient(135deg, #6a1b9a 0%, #ab47bc 50%, #e1bee7 100%);
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(106, 27, 154, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    margin: 1rem;
    border-radius: 12px;
  }
`;

// Header Section
export const PanelHeader = styled.div`
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem;
  }
`;

export const PanelTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f8f9fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

export const PanelSubtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
`;

// Notification Banner
export const NotificationBanner = styled.div`
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  margin: 1rem 2rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 12px 20px;
  }
`;

// Tab Navigation
export const TabHeader = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 2rem 2rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    margin: 0 1rem 1.5rem;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.5rem;
  }
`;

export const TabButton = styled.button`
  flex: 1;
  max-width: 160px;
  background: ${({ $active }) => 
    $active ? 'white' : 'transparent'
  };
  color: ${({ $active }) => 
    $active ? '#6a1b9a' : 'white'
  };
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.3s ease;
    display: ${({ $active }) => $active ? 'none' : 'block'};
  }

  &:hover:not([data-active="true"]) {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);

    &::before {
      left: 100%;
    }
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  ${({ $active }) => $active && css`
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  `}

  @media (max-width: 768px) {
    flex: none;
    min-width: 100px;
    padding: 10px 16px;
    font-size: 13px;
  }
`;

export const CountBadge = styled.span`
  margin-left: 6px;
  background: rgba(255, 224, 130, 0.2);
  color: #ffe082;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  display: inline-block;
`;

// Tab Content
export const TabContent = styled.div`
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2rem 2rem;
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  min-height: 300px;

  @media (max-width: 768px) {
    margin: 0 1rem 1rem;
    padding: 1rem;
  }
`;

// Lists and Items
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ListItem = styled.li`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.4s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const ListItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Avatar Components
export const AvatarWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ab47bc, #e1bee7);
  color: white;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(171, 71, 188, 0.3);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
  }
`;

export const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
`;

export const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

// User Details
export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const UserName = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

export const UserEmail = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $online }) => $online ? '#4caf50' : '#757575'};
  animation: ${({ $online }) => $online ? css`${pulse} 2s infinite` : 'none'};
  box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
`;

// Action Buttons
export const Actions = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const ActionButton = styled.button`
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'success': return 'linear-gradient(135deg, #4caf50, #66bb6a)';
      case 'danger': return 'linear-gradient(135deg, #f44336, #e57373)';
      case 'warning': return 'linear-gradient(135deg, #ff9800, #ffb74d)';
      default: return 'linear-gradient(135deg, #2196f3, #64b5f6)';
    }
  }};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.3s ease;
  }

  &:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// State Messages
export const Loading = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  padding: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &::before {
    content: '⏳';
    font-size: 2rem;
    animation: ${pulse} 1.5s infinite;
  }
`;

export const Message = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.5;

  &::before {
    content: '📭';
    display: block;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

// Section Headers
export const SectionHeader = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.7));
    border-radius: 2px;
  }
`;

// Empty State
export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: white;
  }

  .subtitle {
    font-size: 0.9rem;
    opacity: 0.8;
    line-height: 1.5;
  }
`;