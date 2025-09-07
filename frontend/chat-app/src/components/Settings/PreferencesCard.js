import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { PreferencesContext } from '../../contexts/PreferencesContext';

const PreferencesCard = () => {
  const { preferences, updatePreferences } = useContext(PreferencesContext);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalPrefs({ ...localPrefs, [name]: value });
    setSaved(false);
  };

  const handleSave = () => {
    updatePreferences(localPrefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // feedback reset
  };

  return (
    <Card>
      <Title>Preferences</Title>
      <Form>
        <Field>
          <Label>Language ({localPrefs.language})</Label>
          <Select name="language" value={localPrefs.language} onChange={handleChange}>
            <option value="english">English</option>
            <option value="marathi">Marathi</option>
            <option value="hindi">Hindi</option>
          </Select>
        </Field>

        <Field>
          <Label>Theme Preview</Label>
          <Select name="theme" value={localPrefs.theme} onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </Select>
          <ThemePreview theme={localPrefs.theme}>
            {localPrefs.theme === 'dark' ? 'Dark Mode' : localPrefs.theme === 'light' ? 'Light Mode' : 'Auto'}
          </ThemePreview>
        </Field>

        <SaveBtn type="button" onClick={handleSave}>
          {saved ? '✅ Saved' : 'Save Preferences'}
        </SaveBtn>
      </Form>
    </Card>
  );
};

export default PreferencesCard;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
`;

const Title = styled.h2`
  font-size: 24px;
color: var(--accent-color);
  margin-bottom: 20px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
color: var(--accent-color);
`;

const Select = styled.select`
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: var(--card-bg);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;

  &:focus {
    border-color: var(--accent-color);
    outline: none;
  }
`;

const SaveBtn = styled.button`
background-color: var(--accent-color);

  color: white;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.3s ease;

  &:hover {
    background-color: #8e24aa;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ThemePreview = styled.div`
  margin-top: 10px;
  padding: 15px;
  border-radius: 12px;
  background-color: ${({ theme }) =>
    theme === 'dark' ? '#2c2c2c' : theme === 'light' ? '#f4f4f4' : '#e1bee7'};
  color: ${({ theme }) =>
    theme === 'dark' ? '#eee' : '#333'};
  font-weight: 500;
  transition: all 0.4s ease;
  text-align: center;
`;