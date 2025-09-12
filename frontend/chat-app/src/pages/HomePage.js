import React, { useContext, useEffect, useState, useRef } from "react";
import styled, { ThemeProvider, keyframes, createGlobalStyle, css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import Navbar from "../components/Navbar";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const HomePage = () => {
  const navigate = useNavigate();
  const { name } = useContext(UserContext);
  const [currentTheme, setCurrentTheme] = useState('purple');
  const [typedText, setTypedText] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const fullText = "Welcome to संवाद";

  // Typing animation with cursor
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setTimeout(() => setIsLoaded(true), 500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for interactive effects - with throttling
  useEffect(() => {
    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        rafId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const cycleTheme = () => {
    const themes = ['purple', 'light', 'dark'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  const getTheme = () => {
    switch(currentTheme) {
      case 'light': return lightTheme;
      case 'dark': return darkTheme;
      case 'purple': 
      default: return purpleTheme;
    }
  };

  const getThemeIcon = () => {
    switch(currentTheme) {
      case 'light': return { icon: "🌙", label: "Dark Mode" };
      case 'dark': return { icon: "💜", label: "Purple Mode" };
      case 'purple': 
      default: return { icon: "☀", label: "Light Mode" };
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <GlobalStyle />
      <PageContainer>
        <MouseFollower 
          x={mousePosition.x} 
          y={mousePosition.y} 
          theme={currentTheme}
        />
        
        <NavbarContainer>
          <Navbar />
        </NavbarContainer>

        <ParticlesContainer>
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
              background: { color: { value: "transparent" } },
              fpsLimit: 60, // Reduced for better performance
              interactivity: {
                detectsOn: "canvas", // Important: only detect on canvas
                events: { 
                  onClick: { enable: true, mode: "push" }, 
                  onHover: { enable: true, mode: "grab" },
                  resize: true 
                },
                modes: { 
                  push: { quantity: 2 }, // Reduced quantity
                  grab: { distance: 150, links: { opacity: 0.6 } }, // Reduced distance
                  repulse: { distance: 80, duration: 0.3 } 
                },
              },
              particles: {
                color: { value: currentTheme === 'light' ? "#9c88ff" : "#ffffff" },
                links: {
                  color: currentTheme === 'light' ? "#9c88ff" : "#ffffff",
                  distance: 120, // Reduced distance
                  enable: true,
                  opacity: 0.3, // Reduced opacity
                  width: 1,
                },
                collisions: { enable: false }, // Disabled for performance
                move: { 
                  enable: true, 
                  speed: { min: 0.3, max: 1.2 }, // Reduced speed
                  outModes: { default: "bounce" },
                  attract: { enable: false } // Disabled for performance
                },
                number: { density: { enable: true, area: 1000 }, value: 50 }, // Reduced particles
                opacity: { 
                  value: { min: 0.2, max: 0.5 }, // Reduced opacity
                  animation: { enable: true, speed: 0.8, minimumValue: 0.1 }
                },
                shape: { type: "circle" },
                size: { 
                  value: { min: 1, max: 3 }, // Reduced size
                  animation: { enable: true, speed: 1.5, minimumValue: 0.5 }
                },
              },
              detectRetina: true,
            }}
          />
        </ParticlesContainer>

        <HeroSection ref={heroRef}>
          <FloatingElements>
            <FloatingElement delay="0s" />
            <FloatingElement delay="2s" />
            <FloatingElement delay="4s" />
          </FloatingElements>
          
          <HeroContent>
            <HeroText>
              <TitleContainer>
                <h1>
                  {typedText.includes("संवाद") ? (
                    <>
                      <span>Welcome to </span>
                      <Highlight>संवाद</Highlight>
                      <Cursor show={!isLoaded}>|</Cursor>
                    </>
                  ) : (
                    <>
                      {typedText}
                      <Cursor show={true}>|</Cursor>
                    </>
                  )}
                </h1>
              </TitleContainer>
              
              <SubtitleContainer isLoaded={isLoaded}>
                <p>Connect. Communicate. Collaborate.</p>
                <TagLine>Experience seamless conversations with cutting-edge technology</TagLine>
              </SubtitleContainer>

              <ButtonContainer isLoaded={isLoaded}>
                {!name ? (
                  <ActionButton primary onClick={() => navigate("/signup")}>
                    <ButtonIcon>🚀</ButtonIcon>
                    Get Started
                    <ButtonGlow />
                  </ActionButton>
                ) : (
                  <ActionButton primary onClick={() => navigate("/chat")}>
                    <ButtonIcon>💬</ButtonIcon>
                    Start Chatting
                    <ButtonGlow />
                  </ActionButton>
                )}
                
                <ActionButton secondary onClick={() => scrollToSection('features')}>
                  <ButtonIcon>✨</ButtonIcon>
                  Explore Features
                </ActionButton>
              </ButtonContainer>

              <ThemeToggle onClick={cycleTheme}>
                <ThemeIcon>{getThemeIcon().icon}</ThemeIcon>
                <ThemeLabel>{getThemeIcon().label}</ThemeLabel>
              </ThemeToggle>
            </HeroText>
          </HeroContent>
        </HeroSection>

        <FeaturesSection id="features">
          <SectionTitle>Why Choose संवाद?</SectionTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>End-to-End Encryption</FeatureTitle>
              <FeatureDescription>Your conversations stay private and secure</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>Real-time Messaging</FeatureTitle>
              <FeatureDescription>Instant delivery with zero lag</FeatureDescription>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon>🌐</FeatureIcon>
              <FeatureTitle>Multi-language Support</FeatureTitle>
              <FeatureDescription>Connect across language barriers</FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>

        <Footer>
          <FooterContent>
            <FooterBrand>
              <BrandName>संवाद</BrandName>
              <BrandTagline>Connecting hearts, bridging minds</BrandTagline>
            </FooterBrand>
            <FooterLinks>
<FooterLink onClick={() => navigate("/about")}>About</FooterLink>
<FooterLink onClick={() => navigate("/privacy")}>Privacy Policy</FooterLink>
<FooterLink>Terms of Service</FooterLink>
<FooterLink onClick={() => navigate("/contact")}>Contact Us</FooterLink>

            </FooterLinks>
          </FooterContent>
          <Copyright>© 2025 संवाद. All rights reserved.</Copyright>
        </Footer>
      </PageContainer>
    </ThemeProvider>
  );
};

export default HomePage;

// ===================== Global Styles =====================

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    overflow-x: hidden;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #9c88ff, #ff6b6b);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #8b75ff, #ff5252);
  }
`;

// ===================== Animations =====================

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(156, 136, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(156, 136, 255, 0.6); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// ===================== Themes =====================

const lightTheme = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  text: "#2d3748",
  card: "rgba(255, 255, 255, 0.95)",
  highlight: "#9c88ff",
  footer: "rgba(255, 255, 255, 0.9)",
  footerText: "#4a5568",
  accent: "#f093fb",
};

const darkTheme = {
  background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d1b69 100%)",
  text: "#f7fafc",
  card: "rgba(45, 55, 72, 0.9)",
  highlight: "#ff6b6b",
  footer: "rgba(26, 32, 44, 0.9)",
  footerText: "#cbd5e0",
  accent: "#ff9a9e",
};

const purpleTheme = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  text: "#f7fafc",
  card: "rgba(30, 20, 60, 0.9)",
  highlight: "#9c88ff",
  footer: "rgba(26, 20, 40, 0.9)",
  footerText: "#e2e8f0",
  accent: "#a78bfa",
};

// ===================== Styled Components =====================

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: "Poppins", "Lohit Devanagari", sans-serif;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  position: relative;
`;

// Fixed: Navbar container with proper z-index
const NavbarContainer = styled.div`
  position: relative;
  z-index: 1000; /* Very high z-index to ensure it's above everything */
`;

// Fixed: Mouse follower with lower z-index and pointer-events: none
const MouseFollower = styled.div`
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.theme === 'light' ? 'rgba(156, 136, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  pointer-events: none; /* Critical: This prevents blocking clicks */
  z-index: 500; /* Lower than navbar */
  transition: all 0.1s ease;
  transform: translate(${props => props.x - 10}px, ${props => props.y - 10}px);
`;

// Fixed: Particles container with lower z-index
const ParticlesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* Very low z-index */
  pointer-events: none; /* Prevent particles from blocking clicks */
`;

const HeroSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 60px 20px;
  position: relative;
  z-index: 10; /* Higher than particles but lower than navbar */
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Prevent floating elements from blocking clicks */
  z-index: 2;
`;

const FloatingElement = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, ${props => props.theme.highlight}, ${props => props.theme.accent});
  border-radius: 50%;
  opacity: 0.1;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  
  &:nth-child(1) { top: 20%; left: 10%; }
  &:nth-child(2) { top: 60%; right: 15%; }
  &:nth-child(3) { bottom: 20%; left: 20%; }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 20; /* Higher than hero section */
`;

const HeroText = styled.div`
  max-width: 800px;
  background: ${(props) => props.theme.card};
  padding: 60px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${shimmer} 3s ease-in-out infinite;
    pointer-events: none; /* Prevent shimmer from blocking clicks */
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
    margin: 0 10px;
  }
`;

const TitleContainer = styled.div`
  h1 {
    font-size: 64px;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 48px;
    }
    
    @media (max-width: 480px) {
      font-size: 36px;
    }
  }
`;

const Highlight = styled.span`
  font-family: "Dancing Script", cursive;
  font-size: 96px;
  color: ${(props) => props.theme.highlight};
  text-shadow: 0 0 30px rgba(156, 136, 255, 0.5);
  display: inline-block;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: scale(1.05) rotate(2deg);
    text-shadow: 0 0 40px rgba(156, 136, 255, 0.8);
  }

  @media (max-width: 768px) {
    font-size: 72px;
  }
  
  @media (max-width: 480px) {
    font-size: 56px;
  }
`;

const Cursor = styled.span`
  opacity: ${props => props.show ? 1 : 0};
  animation: ${pulse} 1s infinite;
  color: ${props => props.theme.highlight};
  font-weight: 100;
  margin-left: 2px;
`;

const SubtitleContainer = styled.div`
  opacity: ${props => props.isLoaded ? 1 : 0};
  transform: translateY(${props => props.isLoaded ? '0' : '20px'});
  transition: all 0.8s ease 0.5s;
  
  p {
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: 500;
    color: ${props => props.theme.accent};
  }
`;

const TagLine = styled.div`
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 40px;
  font-style: italic;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  opacity: ${props => props.isLoaded ? 1 : 0};
  transform: translateY(${props => props.isLoaded ? '0' : '20px'});
  transition: all 0.8s ease 1s;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? 
    `linear-gradient(45deg, ${props.theme.highlight}, ${props.theme.accent})` : 
    'transparent'};
  border: ${props => props.primary ? 'none' : `2px solid ${props.theme.highlight}`};
  color: ${props => props.primary ? 'white' : props.theme.highlight};
  padding: 18px 36px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100; /* Ensure buttons are clickable */
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    ${props => props.primary && css`animation: ${glow} 2s ease-in-out infinite;`}
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 16px;
  }
`;

const ButtonIcon = styled.span`
  font-size: 16px;
`;

const ButtonGlow = styled.div`
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
  pointer-events: none; /* Prevent glow from blocking clicks */
  
  ${ActionButton}:hover & {
    left: 100%;
  }
`;

const ThemeToggle = styled.button`
  margin-top: 40px;
  background: rgba(255, 255, 255, 0.1);
  color: ${(props) => props.theme.text};
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  z-index: 100; /* Ensure button is clickable */

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: ${(props) => props.theme.highlight};
    transform: scale(1.05);
  }
`;

const ThemeIcon = styled.span`
  font-size: 16px;
`;

const ThemeLabel = styled.span`
  font-weight: 500;
`;

const FeaturesSection = styled.section`
  padding: 100px 20px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 48px;
  margin-bottom: 60px;
  color: ${props => props.theme.text};
  font-weight: 700;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.card};
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 20;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 15px;
  color: ${props => props.theme.highlight};
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
`;

const Footer = styled.footer`
  background: ${(props) => props.theme.footer};
  backdrop-filter: blur(20px);
  padding: 60px 20px 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
`;

const FooterBrand = styled.div`
  text-align: left;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const BrandName = styled.h3`
  font-size: 32px;
  color: ${props => props.theme.highlight};
  margin-bottom: 10px;
  font-family: "Dancing Script", cursive;
`;

const BrandTagline = styled.p`
  font-size: 12px;
  opacity: 0.8;
  font-style: italic;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  align-items: center;
`;

const FooterLink = styled.span`
  cursor: pointer;
  font-size: 16px;
  color: ${(props) => props.theme.footerText};
  transition: all 0.3s ease;
  position: relative;
  z-index: 100; /* Ensure links are clickable */
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${props => props.theme.highlight};
    transition: width 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    color: ${(props) => props.theme.highlight};
    
    &::after {
      width: 100%;
    }
  }
`;

const Copyright = styled.div`
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  opacity: 0.7;
`;
