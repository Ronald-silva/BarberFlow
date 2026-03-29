import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background.elevated};
  border-top: 2px solid ${props => props.theme.colors.primary.main};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing[6]};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TextContainer = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const Text = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin: 0;
  line-height: 1.6;

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.radii.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary.main};
    color: white;
    border: none;

    &:hover {
      background: ${props.theme.colors.primary.dark};
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 1px solid ${props.theme.colors.border.main};

    &:hover {
      background: ${props.theme.colors.background.secondary};
      border-color: ${props.theme.colors.primary.main};
      color: ${props.theme.colors.text.primary};
    }
  `}
`;

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_DATE_KEY = 'cookie_consent_date';
const COOKIE_CONSENT_VERSION = '1.0';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar se já aceitou cookies
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const consentVersion = localStorage.getItem('cookie_consent_version');

    // Mostrar banner se nunca aceitou ou se a versão mudou
    if (!consent || consentVersion !== COOKIE_CONSENT_VERSION) {
      // Pequeno delay para melhor UX
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    localStorage.setItem('cookie_consent_version', COOKIE_CONSENT_VERSION);
    setShow(false);

    // Aqui você pode habilitar cookies de analytics (Google Analytics, etc.)
    // enableAnalytics();
  };

  const handleRejectOptional = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    localStorage.setItem('cookie_consent_version', COOKIE_CONSENT_VERSION);
    setShow(false);

    // Manter apenas cookies essenciais
    // disableOptionalCookies();
  };

  if (!show) return null;

  return (
    <Banner role="dialog" aria-label="Cookie consent banner">
      <Content>
        <TextContainer>
          <Title>🍪 Uso de Cookies</Title>
          <Text>
            Utilizamos cookies <strong>essenciais</strong> para o funcionamento da plataforma e
            cookies de <strong>desempenho</strong> para melhorar sua experiência. Ao continuar
            navegando, você concorda com nossa{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              Política de Privacidade
            </Link>
            {' '}e uso de cookies.
          </Text>
        </TextContainer>

        <Buttons>
          <Button variant="secondary" onClick={handleRejectOptional} aria-label="Aceitar apenas cookies essenciais">
            Apenas Essenciais
          </Button>
          <Button variant="primary" onClick={handleAccept} aria-label="Aceitar todos os cookies">
            Aceitar Todos
          </Button>
        </Buttons>
      </Content>
    </Banner>
  );
}
