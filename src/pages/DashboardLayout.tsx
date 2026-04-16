import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import styled, { css } from 'styled-components';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, type User, type Subscription } from '../types';
import { barbershopBrandCssVars } from '../lib/barbershopBranding';
import { DashboardIcon, CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon, LogoutIcon, CreditCardIcon } from '../components/icons';
import MobileBottomNav from '../components/ui/MobileBottomNav';
import { supabase } from '../services/supabase';

// ============================================================
// Dashboard shell — marca e cores da barbearia (CSS variables)
// ============================================================

const Layout = styled.div`
  display: flex;
  height: 100vh;
  height: 100dvh;
  background: #0D0D0D;
  overflow: hidden;
`;

/* ===== MOBILE HEADER ===== */
/* Menu aberto: z-index baixo para a barra fixa não cobrir o ✕ do drawer (sidebar 150). */
const MobileHeader = styled.header<{ $menuOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 1rem;
  height: 60px;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #1A1A1A;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${p => (p.$menuOpen ? 60 : 110)};

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
    min-width: 0;
    max-width: min(85vw, 20rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: linear-gradient(
      135deg,
      var(--bs-brand-main, #c8922a) 0%,
      var(--bs-brand-light, #e8b84b) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

/* ===== OVERLAY (desktop / tablet largo; mobile usa <dialog>) ===== */
const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 140;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? 'all' : 'none'};
  transition: opacity 250ms ease;
  touch-action: none;
  cursor: ${p => (p.$visible ? 'pointer' : 'default')};

  @media (min-width: 1024px) { display: none; }
`;

/* Mobile: top layer do navegador — acima de qualquer z-index no #root */
const MobileNavDialog = styled.dialog`
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  background: transparent;
  color: inherit;
  overflow: hidden;

  &::backdrop {
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  @media (min-width: 1024px) {
    display: none !important;
  }
`;

const MobileNavRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
`;

const MobileNavScrim = styled.div`
  flex: 1;
  min-width: 0;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;

/* ===== SIDEBAR ===== */
const Sidebar = styled.aside<{ $open: boolean; $inDialog?: boolean }>`
  width: 260px;
  min-width: 260px;
  background: #0F0F0F;
  border-right: 1px solid #1A1A1A;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  z-index: 150;

  @media (max-width: 1023px) {
    ${p =>
      p.$inDialog
        ? css`
            position: relative;
            top: auto;
            left: auto;
            bottom: auto;
            transform: none;
            flex-shrink: 0;
            height: 100%;
            min-height: 100%;
            max-height: 100dvh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-top: 1.5rem;
            z-index: auto;
          `
        : css`
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(${p.$open ? '0' : '-100%'});
            transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
            padding-top: 1.5rem;
          `}
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
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    background: linear-gradient(
      135deg,
      var(--bs-brand-main, #c8922a) 0%,
      var(--bs-brand-light, #e8b84b) 100%
    );
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
  flex-shrink: 0;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  @media (max-width: 1023px) {
    position: relative;
    z-index: 1;
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
  color: #AFAFAF;
  text-decoration: none;
  transition: all 180ms ease;
  min-height: 44px;
  position: relative;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    opacity: 0.82;
    transition: opacity 180ms ease;
  }

  span { flex: 1; }

  &:hover {
    background: #232323;
    color: #F5F5F5;
    svg { opacity: 1; }
  }

  &.active {
    background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);
    color: var(--bs-brand-light, #e8b84b);
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
      background: linear-gradient(
        180deg,
        var(--bs-brand-main, #c8922a) 0%,
        var(--bs-brand-light, #e8b84b) 100%
      );
      border-radius: 0 2px 2px 0;
    }
  }
`;

const PlanChip = styled(NavLink)<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  border: 1px solid ${p =>
    p.$status === 'active' ? 'rgba(34,197,94,0.35)' :
    p.$status === 'trialing' ? 'rgba(59,130,246,0.35)' :
    'rgba(245,158,11,0.35)'};
  background: ${p =>
    p.$status === 'active' ? 'rgba(34,197,94,0.07)' :
    p.$status === 'trialing' ? 'rgba(59,130,246,0.07)' :
    'rgba(245,158,11,0.07)'};
  transition: all 150ms;
  svg { flex-shrink: 0; opacity: 0.7; color: ${p =>
    p.$status === 'active' ? '#22c55e' :
    p.$status === 'trialing' ? '#3b82f6' :
    '#f59e0b'}; }
  &:hover { filter: brightness(1.15); }
`;

const PlanChipText = styled.div`
  flex: 1;
  min-width: 0;
  span {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #F5F5F5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const PlanChipStatus = styled.div<{ $status?: string }>`
  font-size: 0.675rem;
  font-weight: 500;
  margin-top: 1px;
  color: ${p =>
    p.$status === 'active' ? '#22c55e' :
    p.$status === 'trialing' ? '#3b82f6' :
    '#f59e0b'};
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
  background: linear-gradient(
    135deg,
    var(--bs-brand-main, #c8922a) 0%,
    var(--bs-brand-light, #e8b84b) 100%
  );
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

const MOBILE_NAV_MQ = '(max-width: 1023px)';

function subscribeMobileNav(cb: () => void) {
  const mq = window.matchMedia(MOBILE_NAV_MQ);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function snapshotMobileNav() {
  return window.matchMedia(MOBILE_NAV_MQ).matches;
}

function serverSnapshotMobileNav() {
  return false;
}

type NavItemDef = { to: string; icon: React.ReactElement; label: string };

type SidebarTreeProps = {
  menuOpen: boolean;
  /** Drawer dentro de <dialog> (mobile): sem position:fixed no painel */
  inDialog?: boolean;
  closeMenu: () => void;
  logoSrc: string;
  brandName: string;
  navItems: NavItemDef[];
  user: User;
  initials: string;
  handleLogout: () => void;
  planName?: string;
  planStatus?: string;
};

const SidebarTree: React.FC<SidebarTreeProps> = ({
  menuOpen,
  inDialog,
  closeMenu,
  logoSrc,
  brandName,
  navItems,
  user,
  initials,
  handleLogout,
  planName,
  planStatus,
}) => (
  <Sidebar $open={inDialog ? true : menuOpen} $inDialog={inDialog} className="slide-in">
    <SidebarLogo>
      <img src={logoSrc} alt={brandName} title={brandName} />
      <span title={brandName}>{brandName}</span>
      <CloseBtn
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        }}
        aria-label="Fechar"
      >
        ✕
      </CloseBtn>
    </SidebarLogo>

    <Nav>
      <NavSection>
        <NavSectionLabel>Gestão</NavSectionLabel>
        {navItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavItem>
        ))}
      </NavSection>
    </Nav>

    <UserArea>
      {planName && (
        <PlanChip $status={planStatus} to="subscription" onClick={closeMenu}>
          <CreditCardIcon size={13} />
          <PlanChipText>
            <span>{planName}</span>
            <PlanChipStatus $status={planStatus}>
              {planStatus === 'active' ? 'Ativo' :
               planStatus === 'trialing' ? 'Teste grátis' :
               planStatus === 'pending' ? 'Aguardando pgto.' : planStatus}
            </PlanChipStatus>
          </PlanChipText>
        </PlanChip>
      )}
      <LogoutBtn type="button" onClick={handleLogout}>
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
);

/* ===== MAIN ===== */
const Main = styled.main<{ $menuOpen: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0D0D0D;
  -webkit-overflow-scrolling: touch;
  z-index: 0;
  position: relative;

  @media (max-width: 1023px) {
    padding-top: 60px;
    padding-bottom: 70px;
    ${p =>
      p.$menuOpen &&
      `
      pointer-events: none;
      user-select: none;
    `}
  }

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #0D0D0D; }
  &::-webkit-scrollbar-thumb {
    background: #242424;
    border-radius: 9999px;
    &:hover { background: #363636; }
  }
`;

const DashboardLayout: React.FC = () => {
  const { user, barbershop, logout, subscription } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [planName, setPlanName] = useState<string | undefined>();

  useEffect(() => {
    if (!subscription?.plan_id) return;
    supabase
      .from('subscription_plans')
      .select('name')
      .eq('id', subscription.plan_id)
      .maybeSingle()
      .then(({ data }) => { if (data?.name) setPlanName(data.name); });
  }, [subscription?.plan_id]);
  const isMobile = useSyncExternalStore(subscribeMobileNav, snapshotMobileNav, serverSnapshotMobileNav);
  const mobileNavDialogRef = useRef<HTMLDialogElement>(null);

  const brandStyle = barbershopBrandCssVars(user?.barbershopId, barbershop?.brandPrimaryColor);
  const logoSrc = barbershop?.logoUrl?.trim() ? barbershop.logoUrl : '/logo.png';
  const brandName = barbershop?.name?.trim() || 'Barbearia';

  const handleLogout = () => { logout(); navigate('/login'); };
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) closeMenu(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile || !menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, menuOpen]);

  useEffect(() => {
    if (!isMobile) return;
    const d = mobileNavDialogRef.current;
    if (!d) return;
    if (menuOpen) {
      if (!d.open) {
        try {
          d.showModal();
        } catch {
          /* showModal já aplicado ou restrição do ambiente */
        }
      }
    } else if (d.open) {
      d.close();
    }
  }, [isMobile, menuOpen]);

  useEffect(() => {
    if (isMobile) return;
    const d = mobileNavDialogRef.current;
    if (d?.open) d.close();
  }, [isMobile]);

  if (!user) { return <Navigate to="/login" replace />; }

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

  const sidebarProps = {
    menuOpen,
    closeMenu,
    logoSrc,
    brandName,
    navItems,
    user,
    initials,
    handleLogout,
    planName,
    planStatus: subscription?.status,
  };

  return (
    <Layout style={brandStyle}>
      {/* Mobile Header */}
      <MobileHeader $menuOpen={menuOpen}>
        <MobileLogo>
          <img src={logoSrc} alt={brandName} title={brandName} />
          <span title={brandName}>{brandName}</span>
        </MobileLogo>
      </MobileHeader>

      {!isMobile && (
        <>
          <Overlay $visible={menuOpen} onClick={closeMenu} />
          <SidebarTree {...sidebarProps} />
        </>
      )}

      {isMobile && (
        <MobileNavDialog
          ref={mobileNavDialogRef}
          aria-modal="true"
          aria-label="Menu da barbearia"
          onCancel={e => {
            e.preventDefault();
            closeMenu();
          }}
        >
          <MobileNavRow>
            <SidebarTree {...sidebarProps} inDialog />
            <MobileNavScrim
              role="presentation"
              aria-hidden
              onPointerDown={e => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                e.preventDefault();
                closeMenu();
              }}
            />
          </MobileNavRow>
        </MobileNavDialog>
      )}

      {/* Main Content */}
      <Main $menuOpen={menuOpen}>
        <Outlet />
      </Main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        userRole={user.role}
        onOpenMoreMenu={() => setMenuOpen(true)}
        moreMenuOpen={menuOpen}
      />
    </Layout>
  );
};

export default DashboardLayout;
