import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon, LogoutIcon, CreditCardIcon } from '../components/icons';
import MobileBottomNav from '../components/ui/MobileBottomNav';

// ============================================================
// SHAFAR DashboardLayout v2.0 — Premium Sidebar
// ============================================================

const shimmer = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const Layout = styled.div`
  display: flex;
  height: 100vh;
  height: 100dvh;
  background: #0D0D0D;
  overflow: hidden;
`;

/* ===== MOBILE HEADER ===== */
const MobileHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 60px;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #1A1A1A;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 110;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  img {
    height: 28px;
    width: auto;
    border-radius: 7px;
  }
  
  span {
    font-size: 1.125rem;
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HamburgerBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1A1A1A;
  border: 1px solid #2A2A2A;
  border-radius: 10px;
  color: #ABABAB;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: #222;
    color: #F5F5F5;
  }

  svg { width: 18px; height: 18px; }
`;

/* ===== OVERLAY ===== */
const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 120;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? 'all' : 'none'};
  transition: opacity 250ms ease;

  @media (min-width: 1024px) { display: none; }
`;

/* ===== SIDEBAR ===== */
const Sidebar = styled.aside<{ $open: boolean }>`
  width: 260px;
  min-width: 260px;
  background: #0F0F0F;
  border-right: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  z-index: 130;

  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(${p => p.$open ? '0' : '-100%'});
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    padding-top: 1.5rem;
  }

  @media (min-width: 1280px) {
    width: 280px;
    min-width: 280px;
  }
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
  margin-bottom: 2rem;
  
  img {
    height: 32px;
    width: auto;
    border-radius: 8px;
  }
  
  span {
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 1023px) {
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
`;

const CloseBtn = styled.button`
  display: none;
  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #1A1A1A;
    border: 1px solid #2A2A2A;
    border-radius: 8px;
    color: #6B6B6B;
    cursor: pointer;
    font-size: 1.125rem;
    line-height: 1;
    transition: all 150ms;
    &:hover { color: #F5F5F5; background: #242424; }
  }
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NavSection = styled.div`
  margin-bottom: 1.5rem;
`;

const NavSectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #3D3D3D;
  padding: 0 0.75rem;
  margin-bottom: 0.5rem;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B6B6B;
  text-decoration: none;
  transition: all 180ms ease;
  min-height: 44px;
  position: relative;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.7;
    transition: opacity 180ms ease;
  }

  span { flex: 1; }

  &:hover {
    background: #1A1A1A;
    color: #ABABAB;
    svg { opacity: 0.9; }
  }

  &.active {
    background: rgba(200, 146, 42, 0.1);
    color: #E8B84B;
    font-weight: 600;

    svg { opacity: 1; }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 18px;
      background: linear-gradient(180deg, #C8922A 0%, #E8B84B 100%);
      border-radius: 0 2px 2px 0;
    }
  }
`;

const UserArea = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 12px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 800;
  color: #0D0D0D;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #F5F5F5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole2 = styled.div`
  font-size: 0.6875rem;
  color: #6B6B6B;
  margin-top: 1px;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  width: 100%;
  background: none;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B6B6B;
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 40px;
  font-family: "Inter", sans-serif;

  svg { width: 16px; height: 16px; flex-shrink: 0; }

  &:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #EF4444;
  }
`;

/* ===== MAIN ===== */
const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0D0D0D;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 1023px) {
    padding-top: 60px;
    padding-bottom: 70px;
  }

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #0D0D0D; }
  &::-webkit-scrollbar-thumb {
    background: #242424;
    border-radius: 9999px;
    &:hover { background: #363636; }
  }
`;

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) closeMenu(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!user) { navigate('/login'); return null; }

  const navItems = [
    { to: 'overview', icon: <DashboardIcon />, label: 'Visão Geral', adminOnly: false },
    { to: 'schedule', icon: <CalendarIcon />, label: 'Agenda', adminOnly: false },
    { to: 'clients', icon: <UsersIcon />, label: 'Clientes', adminOnly: false },
    { to: 'services', icon: <ScissorsIcon />, label: 'Serviços', adminOnly: true },
    { to: 'professionals', icon: <TeamIcon />, label: 'Profissionais', adminOnly: true },
    { to: 'subscription', icon: <CreditCardIcon />, label: 'Assinatura', adminOnly: true },
    { to: 'settings', icon: <SettingsIcon />, label: 'Configurações', adminOnly: true },
  ].filter(item => !item.adminOnly || user.role === UserRole.ADMIN);

  const initials = user.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <Layout>
      {/* Mobile Header */}
      <MobileHeader>
        <MobileLogo>
          <img src="/logo.png" alt="Shafar" />
          <span>Shafar</span>
        </MobileLogo>
        <HamburgerBtn onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <MenuIcon />
        </HamburgerBtn>
      </MobileHeader>

      {/* Overlay */}
      <Overlay $visible={menuOpen} onClick={closeMenu} />

      {/* Sidebar */}
      <Sidebar $open={menuOpen} className="slide-in">
        <SidebarLogo>
          <img src="/logo.png" alt="Shafar" />
          <span>Shafar</span>
          <CloseBtn onClick={closeMenu} aria-label="Fechar">✕</CloseBtn>
        </SidebarLogo>

        <Nav>
          <NavSection>
            <NavSectionLabel>Gestão</NavSectionLabel>
            {navItems.map(item => (
              <NavItem
                key={item.to}
                to={item.to}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={closeMenu}
              >
                {React.cloneElement(item.icon, { size: 18 })}
                <span>{item.label}</span>
              </NavItem>
            ))}
          </NavSection>
        </Nav>

        <UserArea>
          <LogoutBtn onClick={handleLogout}>
            <LogoutIcon size={16} />
            Sair da conta
          </LogoutBtn>
          <UserCard>
            <UserAvatar>{initials}</UserAvatar>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserRole2>{user.role === UserRole.ADMIN ? 'Administrador' : 'Profissional'}</UserRole2>
            </UserInfo>
          </UserCard>
        </UserArea>
      </Sidebar>

      {/* Main Content */}
      <Main>
        <Outlet />
      </Main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav userRole={user.role} />
    </Layout>
  );
};

export default DashboardLayout;
