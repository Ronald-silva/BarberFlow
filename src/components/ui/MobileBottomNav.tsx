import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon } from '../icons';
import { UserRole } from '../../types';

// ============================================================
// SHAFAR MobileBottomNav v2.0 — iOS/Android premium pattern
// ============================================================

interface Props {
  userRole: UserRole;
}

const Bar = styled.nav`
  display: none;

  @media (max-width: 1023px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(14, 14, 14, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid #1A1A1A;
    height: 68px;
    padding: 0 0.5rem;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
`;

const Item = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #4A4A4A;
  border-radius: 12px;
  transition: color 180ms ease;
  min-height: 56px;
  position: relative;
  margin: 6px 2px;

  /* Icon */
  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 30px;
    border-radius: 10px;
    background: transparent;
    transition: background 200ms ease;
    position: relative;

    svg {
      width: 20px;
      height: 20px;
      transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  /* Label */
  .nav-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    transition: color 180ms ease;
    line-height: 1;
  }

  /* Hover */
  @media (hover: hover) {
    &:hover {
      color: #6B6B6B;
      .nav-icon { background: rgba(255, 255, 255, 0.04); }
    }
  }

  /* Active */
  &.active {
    color: #E8B84B;

    .nav-icon {
      background: rgba(200, 146, 42, 0.12);

      svg { transform: scale(1.1); }

      /* Active pip */
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 2px;
        background: linear-gradient(90deg, #C8922A, #E8B84B);
        border-radius: 9999px;
      }
    }

    .nav-label { color: #C8922A; }
  }

  /* Press feedback */
  &:active {
    transform: scale(0.93);
    .nav-icon { background: rgba(200, 146, 42, 0.1); }
  }
`;

const MobileBottomNav: React.FC<Props> = ({ userRole }) => {
  const items = [
    { to: 'overview', icon: <DashboardIcon size={20} />, label: 'Início', adminOnly: false },
    { to: 'schedule', icon: <CalendarIcon size={20} />, label: 'Agenda', adminOnly: false },
    { to: 'clients', icon: <UsersIcon size={20} />, label: 'Clientes', adminOnly: false },
    { to: 'services', icon: <ScissorsIcon size={20} />, label: 'Serviços', adminOnly: true },
    { to: 'professionals', icon: <TeamIcon size={20} />, label: 'Equipe', adminOnly: true },
    { to: 'settings', icon: <SettingsIcon size={20} />, label: 'Config.', adminOnly: true },
  ].filter(i => !i.adminOnly || userRole === UserRole.ADMIN);

  return (
    <Bar>
      {items.map(item => (
        <Item
          key={item.to}
          to={item.to}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </Item>
      ))}
    </Bar>
  );
};

export default MobileBottomNav;