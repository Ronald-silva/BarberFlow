import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import pixImage from './pix.png';

interface PixImageProps {
  size?: number;
  animate?: boolean;
}

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 4px 12px rgba(0, 212, 170, 0.3));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 6px 16px rgba(0, 212, 170, 0.5));
  }
`;

const PixImageContainer = styled.div<{ $animate?: boolean; $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;

  ${props => props.$animate && css`
    animation: ${pulseAnimation} 2s ease-in-out infinite;
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 212, 170, 0.4));
    transition: all 0.3s ease;
  }

  &:hover img {
    filter: drop-shadow(0 8px 24px rgba(0, 212, 170, 0.6));
    transform: scale(1.1);
  }
`;

export const PixImage: React.FC<PixImageProps> = ({
  size = 64,
  animate = false
}) => {
  return (
    <PixImageContainer $animate={animate} $size={size}>
      <img src={pixImage} alt="PIX Logo" />
    </PixImageContainer>
  );
};
