// ProfileImageUpload.js
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

const ProfileImageUpload = ({ currentImage, onImageChange }) => {
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageChange(file); // pass File object to parent
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => fileInputRef.current.click();

  return (
    <UploadCard onClick={handleClick}>
      <ImagePreview src={preview || '/default-avatar.png'} alt="Profile preview" />
      <Overlay>
        <Text>Click or Drop to Change</Text>
      </Overlay>
      <HiddenInput
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </UploadCard>
  );
};

export default ProfileImageUpload;

const UploadCard = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #ab47bc;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  box-shadow: 0 4px 8px rgba(106, 27, 154, 0.2);

  &:hover {
    box-shadow: 0 6px 12px rgba(106, 27, 154, 0.35);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(106, 27, 154, 0.4);
  color: white;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;

  ${UploadCard}:hover & {
    opacity: 1;
  }
`;

const Text = styled.span`
  font-weight: bold;
  text-align: center;
`;

const HiddenInput = styled.input`
  display: none;
`;