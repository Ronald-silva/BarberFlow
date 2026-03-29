import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.main};
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin: 0;
`;

const Links = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[6]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: underline;
  }
`;

export function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {new Date().getFullYear()} Shafar. Todos os direitos reservados.
        </Copyright>

        <Links>
          <FooterLink to="/privacy">Política de Privacidade</FooterLink>
          <FooterLink to="/terms">Termos de Uso</FooterLink>
          <FooterLink to="/contact">Contato</FooterLink>
          <FooterLink to="/help">Ajuda</FooterLink>
        </Links>
      </FooterContent>
    </FooterContainer>
  );
}
