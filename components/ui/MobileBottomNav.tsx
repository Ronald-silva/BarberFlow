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
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[1]};
    z-index: ${props => props.theme.zIndex.sticky};
    backdrop-filter: blur(10px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.radii.md};
  text-decoration: none;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: ${props => props.theme.transitions.base};
  min-height: 60px;
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  span {
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  &:hover {
    color: ${props => props.theme.colors.text.secondary};
    background-color: ${props => props.theme.colors.interactive.hover};
  }
  
  &.active {
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primaryLight}20;
    
    svg {
      transform: scale(1.1);
    }
  }
`;

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userRole }) => {
  const navItems = [
    { to: 'overview', icon: <DashboardIcon />, text: 'Início', adminOnly: false },
    { to: 'schedule', icon: <CalendarIcon />, text: 'Agenda', adminOnly: false },
    { to: 'clients', icon: <UsersIcon />, text: 'Clientes', adminOnly: false },
    { to: 'services', icon: <ScissorsIcon />, text: 'Serviços', adminOnly: true },
    { to: 'professionals', icon: <TeamIcon />, text: 'Equipe', adminOnly: true },
    { to: 'settings', icon: <SettingsIcon />, text: 'Config', adminOnly: true },
  ].filter(item => !item.adminOnly || userRole === UserRole.ADMIN);

  return (
    <BottomNavContainer>
      {navItems.map(item => (
        <NavItem
          key={item.to}
          to={item.to}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          {React.cloneElement(item.icon, { size: 20 })}
          <span>{item.text}</span>
        </NavItem>
      ))}
    </BottomNavContainer>
  );
};

export default MobileBottomNav;