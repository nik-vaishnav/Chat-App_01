import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const WelcomeScreen = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: '💬', text: 'Real-time messaging' },
    { icon: '🔒', text: 'Secure & Private' },
    { icon: '🇮🇳', text: 'Made in India' },
    { icon: '⚡', text: 'Lightning Fast' }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <WelcomeContainer role="region" aria-label="Welcome Screen">
      <BackgroundPattern />
      <FloatingElements>
        <FloatingElement delay="0s" size="60px" top="10%" left="10%">💬</FloatingElement>
        <FloatingElement delay="1s" size="40px" top="20%" right="15%">🚀</FloatingElement>
        <FloatingElement delay="2s" size="50px" bottom="30%" left="20%">✨</FloatingElement>
        <FloatingElement delay="0.5s" size="35px" top="60%" right="25%">🔥</FloatingElement>
        <FloatingElement delay="1.5s" size="45px" bottom="15%" right="10%">💫</FloatingElement>
      </FloatingElements>

      <ContentWrapper $isVisible={isVisible}>
        <LogoContainer>
          <MainIcon>🗣️</MainIcon>
          <IconRing />
        </LogoContainer>

        <WelcomeText>
          Welcome to <BrandName>Samvad</BrandName>!
        </WelcomeText>
        
        <WelcomeSubtext>
          The Modern Indian <HighlightText>ChatSystem</HighlightText>
        </WelcomeSubtext>

        <FeatureShowcase>
          <FeatureItem $isActive={true}>
            <FeatureIcon>{features[currentFeature].icon}</FeatureIcon>
            <FeatureText>{features[currentFeature].text}</FeatureText>
          </FeatureItem>
        </FeatureShowcase>

        <ButtonContainer>
          <GetStartedButton onClick={onGetStarted}>
            <ButtonContent>
              <ButtonIcon>🚀</ButtonIcon>
              Get Started
              <ButtonArrow>→</ButtonArrow>
            </ButtonContent>
            <ButtonGlow />
          </GetStartedButton>
          
          <SecondaryButton>
            <ButtonIcon>📱</ButtonIcon>
            Learn More
          </SecondaryButton>
        </ButtonContainer>

        <StatsContainer>
          <StatItem>
            <StatNumber>5+</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatNumber>99.9%</StatNumber>
            <StatLabel>Uptime</StatLabel>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatNumber>🔒</StatNumber>
            <StatLabel>Secure</StatLabel>
          </StatItem>
        </StatsContainer>

        <FooterText>
          Built with ❤️ in India | Connecting hearts through words
        </FooterText>
      </ContentWrapper>

      <WaveDecoration>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </WaveDecoration>
    </WelcomeContainer>
  );
};

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(-10px) rotate(-5deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
`;

const wave = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25px);
  }
`;

// Styled Components
const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: ${gradient} 15s ease infinite;
  position: relative;
  overflow: hidden;
  padding: 20px;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 50px 50px;
  animation: ${float} 20s ease-in-out infinite;
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const FloatingElement = styled.div`
  position: absolute;
  font-size: ${props => props.size};
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  opacity: 0.7;
  ${props => props.top && `top: ${props.top};`}
  ${props => props.bottom && `bottom: ${props.bottom};`}
  ${props => props.left && `left: ${props.left};`}
  ${props => props.right && `right: ${props.right};`}
`;

const ContentWrapper = styled.div`
  text-align: center;
  z-index: 10;
  max-width: 600px;
  width: 100%;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible ? 'translateY(0)' : 'translateY(30px)'};
  transition: all 1s ease-out;
`;

const LogoContainer = styled.div`
  position: relative;
  margin-bottom: 30px;
  display: inline-block;
`;

const MainIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: ${pulse} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
`;

const IconRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: rgba(255, 255, 255, 0.8);
  animation: ${spin} 3s linear infinite;
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: clamp(32px, 8vw, 56px);
  font-weight: 800;
  margin-bottom: 15px;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 1s ease-out 0.2s both;
  line-height: 1.2;
`;

const BrandName = styled.span`
  background: linear-gradient(45deg, #ffd700, #ffed4a, #f093fb);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradient} 3s ease infinite;
  font-weight: 900;
`;

const WelcomeSubtext = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(16px, 4vw, 24px);
  margin-bottom: 40px;
  font-weight: 300;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  line-height: 1.4;
`;

const HighlightText = styled.span`
  color: #ffd700;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
`;

const FeatureShowcase = styled.div`
  margin-bottom: 40px;
  animation: ${fadeInUp} 1s ease-out 0.6s both;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0 auto;
  max-width: 300px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.span`
  font-size: 24px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const FeatureText = styled.span`
  color: white;
  font-weight: 500;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 50px;
  animation: ${slideInLeft} 1s ease-out 0.8s both;
  flex-wrap: wrap;
`;

const GetStartedButton = styled.button`
  position: relative;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0;
  border-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  z-index: 2;
`;

const ButtonIcon = styled.span`
  font-size: 20px;
`;

const ButtonArrow = styled.span`
  transition: transform 0.3s ease;
  
  ${GetStartedButton}:hover & {
    transform: translateX(5px);
  }
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
  animation: ${glow} 2s ease-in-out infinite;
  z-index: 1;
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 13px 25px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  animation: ${fadeInUp} 1s ease-out 1s both;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
`;

const StatDivider = styled.div`
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
  animation: ${fadeInUp} 1s ease-out 1.2s both;
  line-height: 1.5;
`;

const WaveDecoration = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
  
  svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 60px;
    animation: ${wave} 10s ease-in-out infinite;
  }
  
  path {
    fill: rgba(255, 255, 255, 0.1);
  }
`;

export default WelcomeScreen;