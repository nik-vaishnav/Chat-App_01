import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PreferencesProvider } from './contexts/PreferencesContext';  // ✅ NEW

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <UserProvider>
      <NotificationProvider>
        <SocketProvider>
          <PreferencesProvider>  {/* ✅ Added here */}
            <App />
          </PreferencesProvider>
        </SocketProvider>
      </NotificationProvider>
    </UserProvider>
  </BrowserRouter>
);

reportWebVitals();