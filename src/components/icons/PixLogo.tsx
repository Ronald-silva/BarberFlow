import React from 'react';
import styled from 'styled-components';

interface PixLogoProps {
  size?: number;
  color?: string;
  animate?: boolean;
}

const PixSvgContainer = styled.div<{ $animate?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${props => props.$animate && `
    animation: pixPulse 2s ease-in-out infinite;

    @keyframes pixPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
  `}

  svg {
    filter: drop-shadow(0 4px 12px rgba(0, 212, 170, 0.3));
    transition: all 0.3s ease;
  }

  &:hover svg {
    filter: drop-shadow(0 6px 20px rgba(0, 212, 170, 0.5));
    transform: scale(1.05);
  }
`;

export const PixLogo: React.FC<PixLogoProps> = ({
  size = 64,
  color = '#00D4AA',
  animate = false
}) => {
  return (
    <PixSvgContainer $animate={animate}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ícone oficial do PIX do Banco Central */}
        <defs>
          <linearGradient id="pixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00D4AA', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00B894', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle cx="256" cy="256" r="240" fill="url(#pixGradient)" opacity="0.1" />

        {/* PIX Icon - Official Design */}
        <g transform="translate(106, 106)">
          {/* Top Triangle */}
          <path
            d="M150 0 L225 75 L150 75 Z"
            fill="url(#pixGradient)"
          />

          {/* Right Triangle */}
          <path
            d="M300 150 L225 75 L225 225 Z"
            fill="url(#pixGradient)"
          />

          {/* Bottom Triangle */}
          <path
            d="M150 300 L75 225 L225 225 Z"
            fill="url(#pixGradient)"
          />

          {/* Left Triangle */}
          <path
            d="M0 150 L75 75 L75 225 Z"
            fill="url(#pixGradient)"
          />

          {/* Center Diamond - Connecting piece */}
          <path
            d="M150 75 L225 150 L150 225 L75 150 Z"
            fill="url(#pixGradient)"
          />

          {/* Corner connectors for authentic PIX look */}
          <circle cx="75" cy="75" r="15" fill="url(#pixGradient)" />
          <circle cx="225" cy="75" r="15" fill="url(#pixGradient)" />
          <circle cx="225" cy="225" r="15" fill="url(#pixGradient)" />
          <circle cx="75" cy="225" r="15" fill="url(#pixGradient)" />
        </g>
      </svg>
    </PixSvgContainer>
  );
};

// Versão alternativa - Mais clean e moderna
export const PixLogoSimple: React.FC<PixLogoProps> = ({
  size = 64,
  color = '#00D4AA'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="pixGradientSimple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#32BCAD', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00D4AA', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Simplified PIX icon based on official logo */}
      <g transform="translate(128, 128)">
        {/* Top */}
        <rect x="78" y="0" width="100" height="100" rx="20" fill="url(#pixGradientSimple)" />

        {/* Right */}
        <rect x="156" y="78" width="100" height="100" rx="20" fill="url(#pixGradientSimple)" />

        {/* Bottom */}
        <rect x="78" y="156" width="100" height="100" rx="20" fill="url(#pixGradientSimple)" />

        {/* Left */}
        <rect x="0" y="78" width="100" height="100" rx="20" fill="url(#pixGradientSimple)" />

        {/* Center connector */}
        <circle cx="128" cy="128" r="45" fill="url(#pixGradientSimple)" />
      </g>
    </svg>
  );
};
