import React from 'react';
import styled from 'styled-components';

const Line = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.65rem;
  font-weight: 500;
  color: #2a2a2a;
`;

/** “By” — pode ter tracking leve sem alterar maiúsculas */
const Prefix = styled.span`
  letter-spacing: 0.08em;
  opacity: 0.88;
  margin-right: 0.35em;
`;

/** Grafia fixa: RonalDigital */
const Brand = styled.span`
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, rgba(200, 146, 42, 0.45), rgba(232, 184, 75, 0.35));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

/**
 * Atribuição sutil no rodapé (áreas com fundo escuro).
 */
export const ByRonalDigital: React.FC = () => (
  <Line>
    <Prefix>By</Prefix>
    <Brand>RonalDigital</Brand>
  </Line>
);
