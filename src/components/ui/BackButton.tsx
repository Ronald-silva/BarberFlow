import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ============================================================
// BackButton — Botão "← Voltar" padronizado
// ============================================================

interface BackButtonProps {
  /** Rota específica para navegar. Se omitido, usa navigate(-1). */
  to?: string;
  /** Label customizado (padrão: "Voltar") */
  label?: string;
  className?: string;
}

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: ${p => p.theme.colors.text.muted};
  font-size: ${p => p.theme.typography.fontSizes.sm};
  font-family: ${p => p.theme.typography.fonts.primary};
  font-weight: ${p => p.theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: ${p => p.theme.radii.md};
  transition: ${p => p.theme.transitions.fast};
  text-decoration: none;
  letter-spacing: 0.01em;

  &:hover {
    color: ${p => p.theme.colors.text.secondary};
    background-color: ${p => p.theme.colors.bg.hover};
  }

  &:active {
    background-color: ${p => p.theme.colors.bg.elevated};
    transform: translateX(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${p => p.theme.colors.primary.main};
    outline-offset: 2px;
  }
`;

const Arrow = styled.span`
  font-size: 1rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  /* Animação sutil ao hover */
  transition: transform 150ms ease;

  ${Btn}:hover & {
    transform: translateX(-2px);
  }
`;

export const BackButton: React.FC<BackButtonProps> = ({ to, label = 'Voltar', className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Btn
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={`Voltar${label !== 'Voltar' ? ` para ${label}` : ''}`}
    >
      <Arrow>←</Arrow>
      {label}
    </Btn>
  );
};
