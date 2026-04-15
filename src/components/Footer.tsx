import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ============================================================
// SHAFAR Footer v2.0
// ============================================================

const FooterEl = styled.footer`
  background: #0A0A0A;
  border-top: 1px solid #1A1A1A;
  padding: 1.5rem 1.25rem;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
    gap: 1.5rem;
  }
`;

const Copy = styled.p`
  font-size: 0.8125rem;
  color: #3D3D3D;
`;

const Links = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const LinkBtn = styled.button`
  background: none;
  border: none;
  color: #4A4A4A;
  font-size: 0.8125rem;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  transition: color 150ms ease;
  padding: 0;

  &:hover { color: #ABABAB; }
`;

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <FooterEl>
      <Inner>
        <Copy>© {year} Shafar. Todos os direitos reservados.</Copy>
        <Links>
          <LinkBtn onClick={() => navigate('/privacy')}>Política de Privacidade</LinkBtn>
          <LinkBtn onClick={() => navigate('/terms')}>Termos de Uso</LinkBtn>
          <LinkBtn onClick={() => navigate('/login')}>Entrar</LinkBtn>
        </Links>
      </Inner>
    </FooterEl>
  );
}
