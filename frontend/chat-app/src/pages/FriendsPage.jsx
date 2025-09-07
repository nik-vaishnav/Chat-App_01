import React from 'react';
import Navbar from '../components/Navbar';
import FriendPanel from '../pages/FriendPanel';
import styled from 'styled-components';

const FriendsPage = () => {
  return (
    <>
      <Navbar />
      <Wrapper>
        <FriendPanel />
      </Wrapper>
    </>
  );
};

export default FriendsPage;

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    max-width: 100%;
  }
`;
