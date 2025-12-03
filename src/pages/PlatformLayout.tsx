import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, UsersIcon, SettingsIcon, LogoutIcon } from '../components/icons';
import { Text } from '../components/ui/Container';

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.secondary};
  position: relative;
`;

const MobileHeader = styled.header`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${props => props.theme.spacing[4]};
    background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.secondary} 100%);
    border-bottom: 1px solid ${props => props.theme.colors.border.primary};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: ${props => props.theme.zIndex.sticky};
    backdrop-filter: blur(10px);
  }
`;

const MobileLogo = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    background-color: ${props => props.theme.colors.interactive.hover};
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: ${props => props.theme.zIndex.overlay};
    backdrop-filter: blur(4px);
  }
`;

const Sidebar = styled.aside<{ $isOpen?: boolean }>`
  width: 280px;
  background: linear-gradient(180deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.secondary} 100%);
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  box-shadow: ${props => props.theme.shadows.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: ${props => props.theme.zIndex.modal};
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    transition: transform 0.3s ease;
    width: 280px;
    padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]} ${props => props.theme.spacing[4]};
  }
`;

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${props => props.theme.spacing[2]};
  text-align: center;
  letter-spacing: -0.01em;
`;

const PlatformBadge = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Navigation = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.lg};
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: none;
  transition: ${props => props.theme.transitions.base};
  position: relative;
  min-height: 48px;
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  span {
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.interactive.hover};
    color: ${props => props.theme.colors.text.primary};
    transform: translateX(2px);
  }
  
  &.active {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
    color: ${props => props.theme.colors.text.inverse};
    box-shadow: ${props => props.theme.shadows.md};
    
    &::before {
      content: '';
      position: absolute;
      left: -${props => props.theme.spacing[4]};
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: ${props => props.theme.colors.primary};
      border-radius: ${props => props.theme.radii.full};
    }
  }
`;

const UserSection = styled.div`
  margin-top: auto;
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  width: 100%;
  background: none;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.tertiary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.base};
  margin-bottom: ${props => props.theme.spacing[3]};
  min-height: 40px;
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.errorLight};
    color: ${props => props.theme.colors.error};
    transform: translateX(2px);
  }
`;

const UserInfo = styled.div`
  padding: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.background.tertiary};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const UserName = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
`;

const UserEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding-top: 80px;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.secondary};
    border-radius: ${props => props.theme.radii.full};
    
    &:hover {
      background: ${props => props.theme.colors.text.tertiary};
    }
  }
`;

// Icons
const MenuIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformSupportIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformAnalyticsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlatformLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        closeMobileMenu();
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                closeMobileMenu();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) {
        navigate('/login');
        return null;
    }
    
    const navItems = [
        { to: 'overview', icon: <DashboardIcon />, text: 'Visão Geral' },
        { to: 'barbershops', icon: <UsersIcon />, text: 'Barbearias' },
        { to: 'analytics', icon: <PlatformAnalyticsIcon />, text: 'Analytics' },
        { to: 'support', icon: <PlatformSupportIcon />, text: 'Suporte' },
        { to: 'settings', icon: <SettingsIcon />, text: 'Configurações' },
    ];

    return (
        <LayoutContainer>
            <MobileHeader>
                <MobileLogo>BarberFlow Platform</MobileLogo>
                <MenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </MenuButton>
            </MobileHeader>

            <MobileOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />

            <Sidebar $isOpen={isMobileMenuOpen} className="slide-in">
                <Logo>BarberFlow</Logo>
                <PlatformBadge>Platform Admin</PlatformBadge>
                
                <Navigation>
                    {navItems.map(item => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={closeMobileMenu}
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
                            Platform Administrator
                        </Text>
                    </UserInfo>
                </UserSection>
            </Sidebar>

            <MainContent>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
};

export default PlatformLayout;