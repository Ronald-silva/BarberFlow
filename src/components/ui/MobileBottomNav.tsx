import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, MoreHorizIcon } from '../icons';
import { UserRole } from '../../types';

// ============================================================
// Mobile bottom nav — cores da barbearia via --bs-brand-*
// ============================================================

interface Props {
  userRole: UserRole;
  /** Abre o painel lateral (assinatura, sair, lista completa) — substitui o menu hamburger no mobile */
  onOpenMoreMenu?: () => void;
  moreMenuOpen?: boolean;
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
    color: var(--bs-brand-light, #e8b84b);

    .nav-icon {
      background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 12%, transparent);

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
        background: linear-gradient(
          90deg,
          var(--bs-brand-main, #c8922a),
          var(--bs-brand-light, #e8b84b)
        );
        border-radius: 9999px;
      }
    }

    .nav-label { color: var(--bs-brand-main, #c8922a); }
  }

  /* Press feedback */
  &:active {
    transform: scale(0.93);
    .nav-icon {
      background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);
    }
  }
`;

const MoreTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin: 6px 2px;
  min-height: 56px;
  position: relative;
  border: none;
  background: none;
  color: #4a4a4a;
  border-radius: 12px;
  transition: color 180ms ease;
  cursor: pointer;
  font: inherit;
  padding: 0;
  -webkit-tap-highlight-color: transparent;

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 30px;
    border-radius: 10px;
    background: transparent;
    transition: background 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;

    svg {
      width: 20px;
      height: 20px;
      transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  .nav-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    transition: color 180ms ease;
    line-height: 1;
  }

  @media (hover: hover) {
    &:hover {
      color: #6b6b6b;
      .nav-icon {
        background: rgba(255, 255, 255, 0.04);
      }
    }
  }

  ${p =>
    p.$active &&
    css`
      color: var(--bs-brand-light, #e8b84b);

      .nav-icon {
        background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 12%, transparent);

        svg {
          transform: scale(1.1);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          background: linear-gradient(
            90deg,
            var(--bs-brand-main, #c8922a),
            var(--bs-brand-light, #e8b84b)
          );
          border-radius: 9999px;
        }
      }

      .nav-label {
        color: var(--bs-brand-main, #c8922a);
      }
    `}

  &:active {
    transform: scale(0.93);
    .nav-icon {
      background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);
    }
  }
`;

const MobileBottomNav: React.FC<Props> = ({ userRole, onOpenMoreMenu, moreMenuOpen }) => {
  const items = [
    { to: 'overview',       icon: <DashboardIcon size={20} />, label: 'Início',   adminOnly: false },
    { to: 'schedule',       icon: <CalendarIcon  size={20} />, label: 'Agenda',   adminOnly: false },
    { to: 'clients',        icon: <UsersIcon     size={20} />, label: 'Clientes', adminOnly: false },
    { to: 'services',       icon: <ScissorsIcon  size={20} />, label: 'Serviços', adminOnly: true  },
    { to: 'professionals',  icon: <TeamIcon      size={20} />, label: 'Equipe',   adminOnly: true  },
    // Config. foi movido para o menu "Mais" (drawer lateral) — mantém 5 + Mais no rodapé
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
      {onOpenMoreMenu && (
        <MoreTab
          type="button"
          $active={moreMenuOpen}
          onClick={onOpenMoreMenu}
          aria-label="Mais opções"
          aria-expanded={Boolean(moreMenuOpen)}
        >
          <div className="nav-icon">
            <MoreHorizIcon size={20} />
          </div>
          <span className="nav-label">Mais</span>
        </MoreTab>
      )}
    </Bar>
  );
};

export default MobileBottomNav;