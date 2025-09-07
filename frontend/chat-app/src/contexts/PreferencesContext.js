import React, { createContext, useEffect, useState } from 'react';

export const PreferencesContext = createContext();

const defaultPreferences = {
  language: 'english',
  theme: 'auto',
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem('app-preferences');
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('app-preferences', JSON.stringify(preferences));
    applyTheme(preferences.theme);
  }, [preferences]);

  const updatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme'); // auto/default
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};