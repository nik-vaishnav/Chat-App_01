import React, { useContext } from 'react';
import { UserContext } from '../pages/UserContext'; 

const WelcomeUser = () => {
  const { name } = useContext(UserContext);

  return (
    <div>
      Welcome, {name || 'Guest'}!
    </div>
  );
};

export default WelcomeUser;
