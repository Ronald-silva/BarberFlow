import React, { useState, forwardRef, InputHTMLAttributes, CSSProperties } from 'react';
import styled, { css } from 'styled-components';

// ============================================================
// PasswordInput — Campo de senha com toggle olhinho
// ============================================================
// Estratégia: o <input> interno usa uma className gerada por um
// styled.input estendido em cada contexto via styled(PasswordInput).
// O Wrapper recebe a className do styled() pai, e a Inner recebe
// essa mesma classe via inputClassName prop.
// ============================================================

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
  /** className extra aplicada diretamente no <input> (para herdar estilos) */
  inputClassName?: string;
  /** style inline aplicado ao <input> */
  inputStyle?: CSSProperties;
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

// Input base — recebe inputClassName para herdar estilos externos
const Inner = styled.input`
  width: 100%;
  padding-right: 3rem;
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.3rem;
  cursor: pointer;
  color: currentColor;
  opacity: 0;
  transition: opacity 180ms ease;
  border-radius: 4px;
  line-height: 1;
  z-index: 2;

  ${Wrapper}:hover & {
    opacity: 0.45;
  }

  ${Wrapper}:hover &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    opacity: 0.7;
  }
`;

// Ícone "olho aberto"
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Ícone "olho fechado"
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, inputClassName, inputStyle, style, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      /* className vai no Wrapper para styled(PasswordInput) poder usar seletores filhos */
      <Wrapper className={className} style={style}>
        <Inner
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={inputClassName}
          style={{ paddingRight: '3rem', ...inputStyle }}
          {...rest}
        />
        <ToggleBtn
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
        >
          {visible ? <EyeOpen /> : <EyeOff />}
        </ToggleBtn>
      </Wrapper>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { css };
