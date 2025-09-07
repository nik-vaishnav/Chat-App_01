import tw from 'twin.macro';
import styled, { keyframes, css } from 'styled-components';

// 🎨 Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// 🌌 Page Layout
export const Page = styled.div`
  ${tw`flex flex-col min-h-screen font-sans`}
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: ${float} 15s ease-in-out infinite;
`;

export const Main = styled.main`
  ${tw`flex flex-col items-center w-full max-w-6xl px-4 py-12 mx-auto`}
  min-height: calc(100vh - 80px);
`;

// 🚀 Background Effects
export const OrbBackground = styled.div`
  ${tw`fixed inset-0 pointer-events-none`}
  z-index: 0;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    animation: ${float} 12s ease-in-out infinite;
    filter: blur(1px);
  }

  &::before {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &::after {
    bottom: 10%;
    right: 10%;
    animation-delay: 6s;
  }
`;

// 🧊 Profile Card
export const Card = styled.div`
  ${tw`flex flex-col lg:flex-row gap-8 items-start w-full p-8 lg:p-12 rounded-3xl relative`}
  max-width: 1200px;
  margin: auto;
  z-index: 10;

  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 30px 70px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 768px) {
    ${tw`p-6 gap-6`}
  }
`;

// 📱 Responsive Sections
export const LeftSection = styled.div`
  ${tw`w-full lg:w-1/3 flex flex-col items-center`}
`;

export const RightSection = styled.div`
  ${tw`w-full lg:w-2/3 flex flex-col`}
`;

// ⏳ Loading States
export const Spinner = styled.div`
  ${tw`w-12 h-12 border-4 border-white/30 border-t-white rounded-full mb-5`}
  animation: ${spin} 1s linear infinite;
`;

export const LoadingContainer = styled.div`
  ${tw`flex flex-col items-center gap-6 p-12`}
`;

export const LoadingText = styled.p`
  ${tw`text-white text-lg font-medium`}
  animation: ${pulse} 2s ease-in-out infinite;
`;

export const Title = styled.h2`
  ${tw`text-4xl lg:text-5xl font-bold text-white text-center mb-8 tracking-wide`}
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// 👤 Avatar Section
export const AvatarWrap = styled.div`
  ${tw`flex flex-col items-center mb-8`}
`;

export const Avatar = styled.img`
  ${tw`w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover transition-all duration-500`}
  border: 4px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);

  &:hover {
    transform: scale(1.05) rotate(2deg);
    box-shadow: 
      0 15px 40px rgba(0, 0, 0, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
  }

  ${({ $hasError }) => $hasError && css`
    filter: grayscale(100%) brightness(0.7);
    border-color: rgba(239, 68, 68, 0.6);
  `}
`;

export const ProfileImageWrapper = styled.div`
  ${tw`relative`}
`;

export const ImageLoadingOverlay = styled.div`
  ${tw`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center`}
  z-index: 2;

  &::after {
    content: '';
    ${tw`w-8 h-8 border-2 border-white/30 border-t-white rounded-full`}
    animation: ${spin} 1s linear infinite;
  }
`;

export const ImageErrorOverlay = styled.div`
  ${tw`absolute inset-0 bg-red-500/20 rounded-full flex items-center justify-center text-xs text-red-200 text-center p-4`}
  z-index: 2;
  backdrop-filter: blur(4px);
`;

export const Hint = styled.p`
  ${tw`text-sm text-white/80 mt-4 text-center max-w-xs leading-relaxed`}
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

// ❗ Notification System
export const Banner = styled.div`
  ${tw`w-full p-4 text-sm font-semibold rounded-xl border-l-4 mb-6 shadow-lg`}
  background: rgba(248, 113, 113, 0.15);
  border-left-color: #ef4444;
  color: #fee2e2;
  backdrop-filter: blur(10px);
  animation: ${slideIn} 0.3s ease-out;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SuccessBanner = styled.div`
  ${tw`w-full p-4 text-sm font-semibold rounded-xl border-l-4 mb-6 shadow-lg`}
  background: rgba(34, 197, 94, 0.15);
  border-left-color: #22c55e;
  color: #dcfce7;
  backdrop-filter: blur(10px);
  animation: ${slideIn} 0.3s ease-out;
`;

export const ErrorBox = styled.div`
  ${tw`flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-red-300/30 text-center`}
  animation: ${shake} 0.5s ease-in-out;
`;

export const Icon = styled.div`
  ${tw`text-5xl`}
`;

export const Retry = styled.button`
  ${tw`px-4 py-2 text-xs font-bold text-white bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 border border-white/30`}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

// 📝 Profile Details
export const InfoGroup = styled.div`
  ${tw`w-full space-y-4 mt-6`}
`;

export const Info = styled.div`
  ${tw`p-5 rounded-2xl border-l-4 shadow-sm transition-all duration-300`}
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(15px);
  border-left-color: #c084fc;
  border: 1px solid rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateX(5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const Label = styled.span`
  ${tw`block text-sm uppercase font-bold text-purple-200 mb-2 tracking-wider`}
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

export const Value = styled.span`
  ${tw`text-lg text-white font-medium leading-relaxed`}
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

export const Status = styled.span(({ $online }) => [
  tw`text-base font-bold flex items-center gap-3 transition-all duration-300`,
  $online ? tw`text-green-300` : tw`text-gray-300`,
  css`
    &::before {
      content: '';
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${$online ? '#22c55e' : '#6b7280'};
      box-shadow: 0 0 10px ${$online ? '#22c55e' : '#6b7280'}80;
      ${$online && css`animation: ${pulse} 2s ease-in-out infinite;`}
    }
  `
]);

// ✍️ Edit Mode
export const Form = styled.form`
  ${tw`w-full flex flex-col gap-6 mt-8`}
`;

export const Group = styled.div`
  ${tw`flex flex-col gap-3`}
`;

export const Field = styled.input`
  ${tw`p-4 rounded-xl text-base text-white placeholder-white/60 transition-all duration-300`}
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);

  &:focus {
    outline: none;
    border-color: #c084fc;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: 
      0 0 0 4px rgba(192, 132, 252, 0.2),
      0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::placeholder {
    transition: color 0.3s ease;
  }

  &:focus::placeholder {
    color: rgba(255, 255, 255, 0.8);
  }

  ${({ $hasError }) => $hasError && css`
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    animation: ${shake} 0.3s ease-in-out;
  `}
`;

export const Area = styled.textarea`
  ${tw`p-4 rounded-xl text-base resize-y text-white placeholder-white/60 transition-all duration-300`}
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: #c084fc;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: 
      0 0 0 4px rgba(192, 132, 252, 0.2),
      0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  ${({ $hasError }) => $hasError && css`
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    animation: ${shake} 0.3s ease-in-out;
  `}
`;

export const Count = styled.div`
  ${tw`text-sm text-right mt-1 font-medium transition-colors duration-300`}
  color: ${({ $overLimit }) => $overLimit ? '#ef4444' : 'rgba(255, 255, 255, 0.6)'};
`;

export const ValidationError = styled.div`
  ${tw`text-red-300 text-sm mt-2 font-medium flex items-center gap-2`}
  animation: ${slideIn} 0.2s ease-out;

  &::before {
    content: '⚠️';
    ${tw`text-base`}
  }
`;

// 🎛️ Enhanced Buttons
export const Actions = styled.div`
  ${tw`flex flex-wrap justify-center gap-4 mt-8`}
`;

const buttonBase = css`
  ${tw`px-8 py-4 rounded-full font-bold text-base transition-all duration-300 relative overflow-hidden`}
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    ${tw`opacity-60 cursor-not-allowed`}
    transform: none !important;
    box-shadow: none !important;
  }
`;

export const Save = styled.button`
  ${buttonBase}
  ${tw`text-white`}
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: 2px solid rgba(255, 255, 255, 0.2);

  ${({ $loading }) => $loading && css`
    ${tw`cursor-wait`}
    &::after {
      content: '';
      ${tw`w-5 h-5 border-2 border-white/30 border-t-white rounded-full ml-2`}
      animation: ${spin} 1s linear infinite;
      display: inline-block;
    }
  `}
`;

export const Cancel = styled.button`
  ${buttonBase}
  ${tw`text-white`}
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

export const Edit = styled.button`
  ${buttonBase}
  ${tw`text-purple-700 flex items-center justify-center gap-3 mx-auto mt-8`}
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  &:hover {
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  }
`;

export const Pencil = styled.span`
  ${tw`text-xl transition-transform duration-300`}
  
  ${Edit}:hover & {
    transform: rotate(15deg);
  }
`;

export const ButtonSpinner = styled.div`
  ${tw`w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2`}
  animation: ${spin} 1s linear infinite;
`;

export const Note = styled.p`
  ${tw`text-white text-xl text-center mt-8 font-medium`}
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

// 🎯 Utility Components
export const Divider = styled.hr`
  ${tw`border-none h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-8`}
`;

export const Tooltip = styled.div`
  ${tw`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-black/80 rounded-lg opacity-0 pointer-events-none transition-opacity duration-300`}
  backdrop-filter: blur(10px);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }
`;

export const TooltipWrapper = styled.div`
  ${tw`relative`}

  &:hover ${Tooltip} {
    ${tw`opacity-100`}
  }
`;