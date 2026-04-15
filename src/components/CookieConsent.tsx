import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logConsent } from '../services/consentLogger';

// ============================================================
// SHAFAR CookieConsent v2.0 — Discreto, profissional
// ============================================================

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
`;

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  padding: 0.875rem 1.25rem;
  padding-bottom: max(0.875rem, env(safe-area-inset-bottom));
  background: #141414;
  border-top: 1px solid #1E1E1E;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  animation: ${slideIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 1s;

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
    bottom: 1.25rem;
    left: 1.25rem;
    right: auto;
    max-width: 420px;
    border: 1px solid #1E1E1E;
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: 480px) {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TextArea = styled.div`
  flex: 1;
`;

const Title = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #F5F5F5;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const Desc = styled.p`
  font-size: 0.8125rem;
  color: #6B6B6B;
  line-height: 1.55;

  a {
    color: #C8922A;
    text-decoration: none;
    font-weight: 500;
    &:hover { color: #E8B84B; }
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-shrink: 0;

  @media (max-width: 479px) {
    justify-content: flex-end;
  }
`;

const AcceptBtn = styled.button`
  padding: 0.5rem 1.125rem;
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  color: #0D0D0D;
  font-size: 0.8125rem;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  min-height: 36px;
  transition: box-shadow 150ms ease;
  box-shadow: 0 4px 12px rgba(200, 146, 42, 0.3);

  &:hover { box-shadow: 0 6px 16px rgba(200, 146, 42, 0.45); }
`;

const DismissBtn = styled.button`
  padding: 0.5rem 0.875rem;
  background: none;
  color: #6B6B6B;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: "Inter", sans-serif;
  border: 1px solid #2A2A2A;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  min-height: 36px;
  transition: all 150ms ease;

  &:hover {
    background: #1A1A1A;
    color: #ABABAB;
    border-color: #363636;
  }
`;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const accepted = localStorage.getItem('shafar_cookies_accepted');
    if (!accepted) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = async () => {
    localStorage.setItem('shafar_cookies_accepted', 'true');
    localStorage.setItem('shafar_cookies_date', new Date().toISOString());
    
    // Registrar consentimento no banco (LGPD)
    if (user?.id) {
      try {
        await logConsent({
          userId: user.id,
          consentType: 'cookies',
          consentVersion: '1.0',
        });
      } catch (error) {
        console.error('Erro ao registrar consentimento:', error);
        // Não bloquear a ação do usuário por erro de log
      }
    }
    
    setVisible(false);
  };

  const dismiss = async () => {
    localStorage.setItem('shafar_cookies_accepted', 'dismissed');
    localStorage.setItem('shafar_cookies_date', new Date().toISOString());
    
    // Registrar rejeição no banco (LGPD)
    if (user?.id) {
      try {
        await logConsent({
          userId: user.id,
          consentType: 'cookies',
          consentVersion: '1.0',
        });
      } catch (error) {
        console.error('Erro ao registrar rejeição:', error);
        // Não bloquear a ação do usuário por erro de log
      }
    }
    
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Banner role="alert" aria-live="polite">
      <Inner>
        <TextArea>
          <Title>🍪 Cookies</Title>
          <Desc>
            Usamos cookies para melhorar sua experiência. Saiba mais em nossa{' '}
            <Link to="/privacy">Política de Privacidade</Link>.
          </Desc>
        </TextArea>
        <BtnGroup>
          <DismissBtn onClick={dismiss}>Rejeitar</DismissBtn>
          <AcceptBtn onClick={accept}>Aceitar</AcceptBtn>
        </BtnGroup>
      </Inner>
    </Banner>
  );
}
