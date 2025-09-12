import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

const midnightAuroraTheme = {
  name: 'Midnight Aurora',
  background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)',
  text: '#e0e0f8',
  accent: 'linear-gradient(90deg, #00c9ff, #92fe9d)',
  sectionBg: 'rgba(36, 36, 62, 0.7)',
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  background-attachment: fixed;
  background-size: cover;
  padding-bottom: 3rem;
`;

const SectionBox = styled(motion.div)`
  padding: 2.5rem;
  background: ${({ theme }) => theme.sectionBg};
  border-radius: 16px;
  max-width: 960px;
  margin: 2rem auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const AccentTitle = styled.h1`
  background: ${({ theme }) => theme.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const SubTitle = styled.h2`
  margin-top: 2rem;
  font-size: 1.6rem;
  color: #a7ffeb;
`;

const NavLink = styled.a`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  text-decoration: none;
  font-size: 1rem;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: none;

  &:hover {
    color: #92fe9d;
    transition: color 0.3s ease;
  }
`;


const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-top: 0.5rem;
`;

const FeatureList = styled.ul`
  margin-top: 1rem;
  list-style: none;
  padding-left: 0;

  li {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
  }

  li span {
    margin-right: 0.8rem;
    font-size: 1.3rem;
  }
`;

const CTAButton = styled.a`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.8rem 1.8rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  background: ${({ theme }) => theme.accent};
  color: #0f0c29;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0px 8px 20px rgba(0, 201, 255, 0.5);
  }
`;

const AboutPage = () => {
  return (
    <ThemeProvider theme={midnightAuroraTheme}>
      <GlobalStyle />
      <PageContainer>
        <Navbar />
        <SectionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AccentTitle>Welcome to संवाद 🌌</AccentTitle>
          <Paragraph>
            Your gateway to seamless and efficient communication!
          </Paragraph>

          <SubTitle>🚀 Our Mission</SubTitle>
          <Paragraph>
            To provide a reliable and user-friendly platform where people can
            connect, collaborate, and communicate without boundaries.
          </Paragraph>

          <SubTitle>✨ App Features</SubTitle>
          <FeatureList>
            <li><span>📱</span> Easy-to-use Interface</li>
            <li><span>🔒</span> Secure Messaging</li>
            <li><span>🎨</span> Customizable Profiles</li>
            <li><span>⚡</span> Real-time Communication</li>
          </FeatureList>

          <SubTitle>🌍 Why Choose Samvad?</SubTitle>
          <Paragraph>
            Samvad offers a platform that prioritizes your needs and adapts to
            your lifestyle. Whether you're chatting with friends, collaborating
            with teams, or talking with family, Samvad offers secure and
            seamless communication.
          </Paragraph>

          <SubTitle>💡 Key Benefits</SubTitle>
          <FeatureList>
            <li><span>✅</span> User-centric Design</li>
            <li><span>✅</span> Cutting-edge Security</li>
            <li><span>✅</span> Seamless Synchronization</li>
            <li><span>✅</span> Multi-language Support</li>
            <li><span>✅</span> Cross-platform Compatibility</li>
          </FeatureList>

          <SubTitle>🚀 Get Started Today</SubTitle>
          <Paragraph>
            Join thousands of users who made Samvad their go-to platform. Sign
            up today and start connecting!
          </Paragraph>

          <div style={{ textAlign: 'center' }}>
            <CTAButton href="/signup">Sign Up Now</CTAButton>
          </div>
        </SectionBox>
      </PageContainer>
    </ThemeProvider>
  );
};

export default AboutPage;