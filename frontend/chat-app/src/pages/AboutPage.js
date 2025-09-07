import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Navbar from '../components/Navbar';

const midnightAuroraTheme = {
  name: 'Midnight Aurora',
  background: 'linear-gradient(145deg, #0f0c29, #302b63, #24243e)',
  text: '#e0e0f8',
  accent: 'linear-gradient(90deg, #00c9ff, #92fe9d)',
  sectionBg: 'rgba(36, 36, 62, 0.6)',
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: all 0.3s ease;
  }
`;

const PageContainer = styled.div`
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  background-attachment: fixed;
  background-size: cover;
`;

const SectionBox = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.sectionBg};
  border-radius: 12px;
  max-width: 960px;
  margin: 2rem auto;
`;

const AccentTitle = styled.h1`
  background: ${({ theme }) => theme.accent};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  text-align: center;
`;

const AboutPage = () => {
  return (
    <ThemeProvider theme={midnightAuroraTheme}>
      <GlobalStyle />
      <PageContainer>
        <Navbar />
        <SectionBox>
          <AccentTitle>Welcome to संवाद</AccentTitle>
          <p>Your gateway to seamless and efficient communication!</p>

          <h2>Our Mission</h2>
          <p>
            To provide a reliable and user-friendly platform where people can
            connect, collaborate, and communicate without boundaries.
          </p>

          <h2>App Features</h2>
          <ul>
            <li>📱 Easy-to-use Interface</li>
            <li>🔒 Secure Messaging</li>
            <li>🎨 Customizable Profiles</li>
            <li>⚡ Real-time Communication</li>
          </ul>

          <h2>Why Choose Samvad?</h2>
          <p>
            Samvad offers a platform that prioritizes your needs and adapts to
            your lifestyle. Whether you're chatting with friends, collaborating
            with teams, or talking with family, Samvad offers secure and
            seamless communication.
          </p>

          <h2>Key Benefits</h2>
          <ul>
            <li>✅ User-centric Design</li>
            <li>✅ Cutting-edge Security</li>
            <li>✅ Seamless Synchronization</li>
            <li>✅ Multi-language Support</li>
            <li>✅ Cross-platform Compatibility</li>
          </ul>

          <h2>Get Started Today</h2>
          <p>
            Join thousands of users who made Samvad their go-to platform. Sign
            up today and start connecting!
          </p>
        </SectionBox>
      </PageContainer>
    </ThemeProvider>
  );
};

export default AboutPage;