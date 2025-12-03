import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon } from '../icons';
import { UserRole } from '../../types';

interface MobileBottomNavProps {
  userRole: UserRole;
}

const BottomNavContainer = styled.nav`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.secondary} 100%);
    border-top: 1px solid ${props => props.theme.colors.border.primary};
    padding: ${props => props.theme.spacing[1]} 0;
    z-index: ${props => props.theme.zIndex.sticky};
    backdrop-filter: blur(10px);
    box-shadow: ${props => props.theme.shadows.lg};
    height: 70px; /* Fixed height for consistency */
    
    /* Safe area support for iOS devices */
    @supports (padding: max(0px)) {
      padding-bottom: max(${props => props.theme.spacing[1]}, env(safe-area-inset-bottom));
    }
  }
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px; /* Fixed gap for consistency */
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.radii.md};
  text-decoration: none;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 11px; /* Smaller font for mobile */
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: ${props => props.theme.transitions.fast};
  min-height: 56px; /* Optimal touch target */
  position: relative;
  
  /* Icon container for consistent sizing */
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  span {
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    font-size: 10px; /* Even smaller text */
    letter-spacing: 0.01em;
  }
  
  /* Hover effects (for devices that support it) */
  @media (hover: hover) {
    &:hover {
      color: ${props => props.theme.colors.text.secondary};
      background-color: ${props => props.theme.colors.interactive.hover};
    }
  }
  
  /* Active state with better visual feedback */
  &.active {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primaryLight}15;
    
    .icon-container {
      transform: scale(1.05);
    }
    
    span {
      font-weight: ${props => props.theme.typography.fontWeights.semibold};
    }
    
    /* Active indicator */
    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: ${props => props.theme.colors.primary};
      border-radius: ${props => props.theme.radii.full};
    }
  }
  
  /* Pressed state for better touch feedback */
  &:active {
    transform: scale(0.95);
    background-color: ${props => props.theme.colors.interactive.pressed || props.theme.colors.interactive.hover};
  }
`;

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userRole }) => {
  const navItems = [
    { to: 'overview', icon: <DashboardIcon size={20} />, text: 'Início', adminOnly: false },
    { to: 'schedule', icon: <CalendarIcon size={20} />, text: 'Agenda', adminOnly: false },
    { to: 'clients', icon: <UsersIcon size={20} />, text: 'Clientes', adminOnly: false },
    { to: 'services', icon: <ScissorsIcon size={20} />, text: 'Serviços', adminOnly: true },
    { to: 'professionals', icon: <TeamIcon size={20} />, text: 'Equipe', adminOnly: true },
    { to: 'settings', icon: <SettingsIcon size={20} />, text: 'Config', adminOnly: true },
  ].filter(item => !item.adminOnly || userRole === UserRole.ADMIN);

  return (
    <BottomNavContainer>
      {navItems.map(item => (
        <NavItem
          key={item.to}
          to={item.to}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <div className="icon-container">
            {item.icon}
          </div>
          <span>{item.text}</span>
        </NavItem>
      ))}
    </BottomNavContainer>
  );
};

export default MobileBottomNav;