import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, UsersIcon, SettingsIcon, LogoutIcon } from '../components/icons';
import { Text } from '../components/ui/Container';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${p => p.theme.colors.background.primary};
  color: ${p => p.theme.colors.text.secondary};
  overflow: hidden;
`;

/* ===== MOBILE HEADER ===== */
const MobileHeader = styled.header`
  display: none;

  @media (max-width: ${p => p.theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    height: 56px;
    background: linear-gradient(135deg, ${p => p.theme.colors.background.elevated} 0%, ${p => p.theme.colors.background.secondary} 100%);
    border: 1px solid ${p => p.theme.colors.border.primary};
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    width: auto;
    box-sizing: border-box;
    z-index: ${p => p.theme.zIndex.sticky};
    backdrop-filter: blur(10px);
    border-radius: 14px;
    
    /* Suporte para notch/safe area */
    margin-top: env(safe-area-inset-top);
  }
`;

const MobileLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  img { height: 28px; width: auto; border-radius: 7px; }

  span {
    font-size: ${p => p.theme.typography.fontSizes.xl};
    font-weight: ${p => p.theme.typography.fontWeights.bold};
    background: linear-gradient(135deg, ${p => p.theme.colors.primary} 0%, ${p => p.theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: ${p => p.theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${p => p.theme.radii.md};
  transition: ${p => p.theme.transitions.base};

  &:hover { background-color: ${p => p.theme.colors.interactive.hover}; }
  svg { width: 24px; height: 24px; }
`;

/* ===== MOBILE DRAWER (dialog nativo) ===== */
const MobileDrawerDialog = styled.dialog`
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  background: transparent;
  overflow: hidden;

  &::backdrop {
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  @media (min-width: 1024px) { display: none !important; }
`;

const DrawerRow = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
`;

const DrawerScrim = styled.div`
  flex: 1;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;

/* ===== SIDEBAR (desktop) ===== */
const Sidebar = styled.aside`
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, ${p => p.theme.colors.background.elevated} 0%, ${p => p.theme.colors.background.secondary} 100%);
  border-right: 1px solid ${p => p.theme.colors.border.primary};
  display: flex;
  flex-direction: column;
  padding: ${p => p.theme.spacing[6]} ${p => p.theme.spacing[4]};
  box-shadow: ${p => p.theme.shadows.lg};

  @media (max-width: ${p => p.theme.breakpoints.lg}) {
    display: none;
  }
`;

/* Painel dentro do drawer mobile */
const DrawerPanel = styled.div`
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, ${p => p.theme.colors.background.elevated} 0%, ${p => p.theme.colors.background.secondary} 100%);
  border-right: 1px solid ${p => p.theme.colors.border.primary};
  display: flex;
  flex-direction: column;
  padding: ${p => p.theme.spacing[6]} ${p => p.theme.spacing[4]};
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const SidebarLogoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${p => p.theme.spacing[2]};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  img { height: 36px; width: auto; border-radius: 9px; }

  span {
    font-size: ${p => p.theme.typography.fontSizes['2xl']};
    font-weight: ${p => p.theme.typography.fontWeights.bold};
    background: linear-gradient(135deg, ${p => p.theme.colors.primary} 0%, ${p => p.theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.01em;
  }
`;

const DrawerCloseBtn = styled.button`
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
  flex-shrink: 0;
  transition: all 150ms;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover { color: #F5F5F5; background: #242424; }
`;

const PlatformBadge = styled.div`
  background: linear-gradient(135deg, ${p => p.theme.colors.primary} 0%, ${p => p.theme.colors.primaryDark} 100%);
  color: #F8F8F8;
  padding: ${p => p.theme.spacing[1]} ${p => p.theme.spacing[3]};
  border-radius: ${p => p.theme.radii.full};
  font-size: ${p => p.theme.typography.fontSizes.xs};
  font-weight: ${p => p.theme.typography.fontWeights.bold};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${p => p.theme.spacing[6]};
`;

const Navigation = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${p => p.theme.spacing[1]};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${p => p.theme.spacing[3]};
  padding: ${p => p.theme.spacing[3]} ${p => p.theme.spacing[4]};
  border-radius: ${p => p.theme.radii.lg};
  font-size: ${p => p.theme.typography.fontSizes.base};
  font-weight: ${p => p.theme.typography.fontWeights.medium};
  color: ${p => p.theme.colors.text.secondary};
  text-decoration: none;
  transition: ${p => p.theme.transitions.base};
  position: relative;
  min-height: 48px;
  touch-action: manipulation;

  svg { width: 20px; height: 20px; flex-shrink: 0; }
  span { line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  &:hover {
    background-color: rgba(200, 146, 42, 0.16);
    color: #F5F5F5;
    transform: translateX(2px);
  }

  &.active {
    background: linear-gradient(135deg, ${p => p.theme.colors.primary} 0%, ${p => p.theme.colors.primaryDark} 100%);
    color: #F8F8F8;
    box-shadow: ${p => p.theme.shadows.md};

    &::before {
      content: '';
      position: absolute;
      left: -${p => p.theme.spacing[4]};
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: ${p => p.theme.colors.primary};
      border-radius: ${p => p.theme.radii.full};
    }
  }
`;

const UserSection = styled.div`
  margin-top: auto;
  padding-top: ${p => p.theme.spacing[4]};
  border-top: 1px solid ${p => p.theme.colors.border.primary};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${p => p.theme.spacing[3]};
  padding: ${p => p.theme.spacing[2]} ${p => p.theme.spacing[3]};
  width: 100%;
  background: none;
  border: none;
  border-radius: ${p => p.theme.radii.md};
  font-size: ${p => p.theme.typography.fontSizes.sm};
  font-weight: ${p => p.theme.typography.fontWeights.medium};
  color: ${p => p.theme.colors.text.tertiary};
  cursor: pointer;
  transition: ${p => p.theme.transitions.base};
  margin-bottom: ${p => p.theme.spacing[3]};
  min-height: 40px;
  font-family: inherit;

  svg { width: 18px; height: 18px; flex-shrink: 0; }

  &:hover {
    background-color: ${p => p.theme.colors.errorLight};
    color: ${p => p.theme.colors.error};
    transform: translateX(2px);
  }
`;

const UserInfo = styled.div`
  padding: ${p => p.theme.spacing[3]};
  background-color: ${p => p.theme.colors.background.tertiary};
  border-radius: ${p => p.theme.radii.md};
  border: 1px solid ${p => p.theme.colors.border.primary};
`;

const UserName = styled.p`
  font-size: ${p => p.theme.typography.fontSizes.sm};
  font-weight: ${p => p.theme.typography.fontWeights.semibold};
  color: ${p => p.theme.colors.text.primary};
  margin: 0 0 ${p => p.theme.spacing[1]} 0;
`;

const UserEmail = styled.p`
  font-size: ${p => p.theme.typography.fontSizes.xs};
  color: ${p => p.theme.colors.text.tertiary};
  margin: 0;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: ${p => p.theme.colors.background.primary};

  @media (max-width: ${p => p.theme.breakpoints.lg}) {
    padding-top: 80px;
  }

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: ${p => p.theme.colors.background.secondary}; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme.colors.border.secondary};
    border-radius: ${p => p.theme.radii.full};
    &:hover { background: ${p => p.theme.colors.text.tertiary}; }
  }
`;

// Icons
const MenuIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformSupportIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformAnalyticsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Fecha ao trocar de rota
  useEffect(() => { closeMobileMenu(); }, [location.pathname]);

  // Fecha ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) closeMobileMenu(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Controla o <dialog> nativo
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (isMobileMenuOpen) {
      if (!d.open) { try { d.showModal(); } catch { /* já aberto */ } }
    } else if (d.open) {
      d.close();
    }
  }, [isMobileMenuOpen]);

  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { to: 'overview', icon: <DashboardIcon />, text: 'Visão Geral' },
    { to: 'barbershops', icon: <UsersIcon />, text: 'Barbearias' },
    { to: 'analytics', icon: <PlatformAnalyticsIcon />, text: 'Analytics' },
    { to: 'support', icon: <PlatformSupportIcon />, text: 'Suporte' },
    { to: 'settings', icon: <SettingsIcon />, text: 'Configurações' },
  ];

  const navContent = (onItemClick?: () => void) => (
    <>
      <PlatformBadge>Admin da Plataforma</PlatformBadge>
      <Navigation>
        {navItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={onItemClick}
          >
            {React.cloneElement(item.icon, { size: 20 })}
            <span>{item.text}</span>
          </NavItem>
        ))}
      </Navigation>
      <UserSection>
        <LogoutButton onClick={handleLogout}>
          <LogoutIcon size={20} />
          <span>Sair</span>
        </LogoutButton>
        <UserInfo>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
          <Text $size="xs" $color="tertiary" style={{ marginTop: '0.25rem' }}>
            Administrador da Plataforma
          </Text>
        </UserInfo>
      </UserSection>
    </>
  );

  return (
    <LayoutContainer>
      {/* Header mobile fixo */}
      <MobileHeader>
        <MobileLogo>
          <img src="/logo.png" alt="Shafar" />
          <span>Plataforma Shafar</span>
        </MobileLogo>
        <MenuButton onClick={() => setIsMobileMenuOpen(v => !v)} aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}>
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MenuButton>
      </MobileHeader>

      {/* Sidebar desktop (sempre visível, escondida via CSS no mobile) */}
      <Sidebar>
        <Logo style={{ marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="Shafar" />
          <span>Shafar</span>
        </Logo>
        {navContent()}
      </Sidebar>

      {/* Drawer mobile via <dialog> nativo — z-index acima de tudo, sem conflito */}
      <MobileDrawerDialog
        ref={dialogRef}
        aria-modal="true"
        aria-label="Menu da plataforma"
        onCancel={e => { e.preventDefault(); closeMobileMenu(); }}
      >
        <DrawerRow>
          <DrawerPanel>
            <SidebarLogoRow>
              <Logo>
                <img src="/logo.png" alt="Shafar" />
                <span>Shafar</span>
              </Logo>
              <DrawerCloseBtn
                type="button"
                onClick={closeMobileMenu}
                aria-label="Fechar menu"
              >
                ✕
              </DrawerCloseBtn>
            </SidebarLogoRow>
            {navContent(closeMobileMenu)}
          </DrawerPanel>
          <DrawerScrim
            role="presentation"
            aria-hidden
            onPointerDown={e => {
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              e.preventDefault();
              closeMobileMenu();
            }}
          />
        </DrawerRow>
      </MobileDrawerDialog>

      <MainContent data-app-shell="platform">
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default PlatformLayout;
