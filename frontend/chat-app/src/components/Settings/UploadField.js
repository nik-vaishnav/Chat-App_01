// UploadField.js
import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

const UploadField = ({ imageUrl, onUpload }) => {
  const [preview, setPreview] = useState(imageUrl);
  const inputRef = useRef();

  useEffect(() => {
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleChange = e => {
    const file = e.target.files[0];
    if (file && /^image\/(jpeg|png|gif)$/i.test(file.type)) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onUpload(file);
    } else {
      alert('Please select a JPG, PNG, or GIF image');
    }
  };

  return (
    <Container>
      <Image
        src={preview || '/default-avatar.png'}
        alt="Profile preview"
        onClick={() => inputRef.current.click()}
      />
      <UploadButton type="button" onClick={() => inputRef.current.click()}>
        Change Picture
      </UploadButton>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </Container>
  );
};

export default UploadField;

// Styled components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6a1b9a;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const UploadButton = styled.button`
  background-color: #8e24aa;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background-color: #a14dbb;
  }
`;