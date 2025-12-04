
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const defaultIconProps = {
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <line x1="16" y1="3" x2="16" y2="7" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <line x1="11" y1="15" x2="12" y2="15" />
    <line x1="12" y1="15" x2="12" y2="18" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

export const ScissorsIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <circle cx="6" cy="7" r="3" />
    <circle cx="6" cy="17" r="3" />
    <line x1="8.6" y1="8.6" x2="19" y2="19" />
    <line x1="8.6" y1="15.4" x2="19" y2="5" />
  </svg>
);

export const TeamIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37a1.724 1.724 0 0 0 2.572 -1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </svg>
);

export const DashboardIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M4 20l14 0" />
  </svg>
);

export const PixIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M7 15l4 -4l4 4" />
    <path d="M7 9l4 4l4 -4" />
  </svg>
);

export const BitcoinIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg 
    {...defaultIconProps} 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8h4.09c1.055 0 1.91 .895 1.91 2s-.855 2 -1.91 2c1.055 0 1.91 .895 1.91 2s-.855 2 -1.91 2h-4.09" />
    <path d="M10 12h4" />
    <path d="M10 7v10v-9" />
    <path d="M13 7v1" />
    <path d="M13 16v1" />
  </svg>
);

export const PaymentIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    {...defaultIconProps}
    width={size}
    height={size}
    className={className}
    viewBox="0 0 24 24"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="7" y1="15" x2="7.01" y2="15" />
    <line x1="11" y1="15" x2="13" y2="15" />
  </svg>
);

// Export PIX Image component
export { PixImage } from './icons/PixImage';
