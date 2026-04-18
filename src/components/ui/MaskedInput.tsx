import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import type { MaskType } from '../../hooks/useMask';

// ============================================================
// MaskedInput — Input com máscara automática + validação visual
// ============================================================

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask?: MaskType;
  /** Valor mascarado a exibir */
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** null = neutro, true = válido, false = inválido */
  isValid?: boolean | null;
  /** Mensagem de erro exibida abaixo do campo */
  errorMessage?: string;
  /** Label opcional */
  label?: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Helper text */
  helperText?: string;
  $variant?: 'default' | 'filled' | 'outlined';
  $size?: 'sm' | 'md' | 'lg';
}

// ----------- Styled -----------

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`;

const LabelEl = styled.label<{ $required?: boolean; $error?: boolean }>`
  font-size: ${p => p.theme.typography.fontSizes.sm};
  font-weight: ${p => p.theme.typography.fontWeights.semibold};
  color: ${p => p.$error ? p.theme.colors.error.main : p.theme.colors.text.secondary};
  letter-spacing: ${p => p.theme.typography.letterSpacings.wide};

  ${p => p.$required && css`
    &::after {
      content: ' *';
      color: ${p.theme.colors.error.main};
    }
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  $error?: boolean;
  $valid?: boolean;
  $variant?: 'default' | 'filled' | 'outlined';
  $size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  border-radius: ${p => p.theme.radii.lg};
  color: ${p => p.theme.colors.text.primary};
  font-family: ${p => p.theme.typography.fonts.primary};
  font-weight: ${p => p.theme.typography.fontWeights.medium};
  transition: ${p => p.theme.transitions.base};
  padding-right: 2.5rem; /* espaço para o ícone de status */

  /* Tamanhos */
  ${p => p.$size === 'sm' && css`
    padding: ${p.theme.spacing[3]} ${p.theme.spacing[4]};
    font-size: ${p.theme.typography.fontSizes.sm};
    min-height: 44px;
  `}
  ${p => (!p.$size || p.$size === 'md') && css`
    padding: ${p.theme.spacing[3]} ${p.theme.spacing[4]};
    font-size: ${p.theme.typography.fontSizes.base};
    min-height: 48px;
  `}
  ${p => p.$size === 'lg' && css`
    padding: ${p.theme.spacing[4]} ${p.theme.spacing[5]};
    font-size: ${p.theme.typography.fontSizes.lg};
    min-height: 56px;
  `}

  /* Variantes */
  ${p => (!p.$variant || p.$variant === 'default') && css`
    background-color: ${p.theme.colors.bg.card};
    border: 1px solid ${p.theme.colors.bg.border};
    &:hover:not(:focus):not(:disabled) {
      border-color: ${p.theme.colors.border.secondary};
      background-color: ${p.theme.colors.bg.hover};
    }
    &:focus {
      outline: none;
      border-color: ${p.theme.colors.primary.main};
      background-color: ${p.theme.colors.bg.hover};
      box-shadow: 0 0 0 4px color-mix(in srgb, ${p.theme.colors.primary.main} 15%, transparent);
    }
  `}
  ${p => p.$variant === 'filled' && css`
    background-color: ${p.theme.colors.bg.elevated};
    border: 1px solid transparent;
    &:hover:not(:focus):not(:disabled) { background-color: ${p.theme.colors.bg.overlay}; }
    &:focus {
      outline: none;
      border-color: ${p.theme.colors.primary.main};
      background-color: ${p.theme.colors.bg.overlay};
      box-shadow: 0 0 0 4px color-mix(in srgb, ${p.theme.colors.primary.main} 15%, transparent);
    }
  `}
  ${p => p.$variant === 'outlined' && css`
    background-color: transparent;
    border: 1px solid ${p.theme.colors.bg.border};
    &:hover:not(:focus):not(:disabled) { border-color: ${p.theme.colors.border.secondary}; }
    &:focus {
      outline: none;
      border-color: ${p.theme.colors.primary.main};
      box-shadow: 0 0 0 4px color-mix(in srgb, ${p.theme.colors.primary.main} 15%, transparent);
    }
  `}

  /* Estado de erro */
  ${p => p.$error && css`
    border-color: ${p.theme.colors.error.main} !important;
    background-color: color-mix(in srgb, ${p.theme.colors.error.main} 5%, transparent);
    &:focus { box-shadow: 0 0 0 4px color-mix(in srgb, ${p.theme.colors.error.main} 20%, transparent); }
  `}

  /* Estado válido */
  ${p => p.$valid && css`
    border-color: ${p.theme.colors.success.main} !important;
    &:focus { box-shadow: 0 0 0 4px color-mix(in srgb, ${p.theme.colors.success.main} 20%, transparent); }
  `}

  &::placeholder { color: ${p => p.theme.colors.text.tertiary}; font-weight: 400; }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusIcon = styled.span<{ $valid: boolean }>`
  position: absolute;
  right: 0.75rem;
  font-size: 0.875rem;
  pointer-events: none;
  color: ${p => p.$valid ? p.theme.colors.success.main : p.theme.colors.error.main};
  line-height: 1;
`;

const HelperEl = styled.span`
  font-size: ${p => p.theme.typography.fontSizes.xs};
  color: ${p => p.theme.colors.text.tertiary};
`;

const ErrorEl = styled.span`
  font-size: ${p => p.theme.typography.fontSizes.xs};
  color: ${p => p.theme.colors.error.main};
  font-weight: ${p => p.theme.typography.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// ----------- Component -----------

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask: _mask,
      value,
      onChange,
      isValid,
      errorMessage,
      label,
      required,
      helperText,
      $variant,
      $size,
      ...rest
    },
    ref
  ) => {
    const showStatus = isValid !== null && isValid !== undefined && value !== '';

    return (
      <Wrapper>
        {label && (
          <LabelEl htmlFor={rest.id} $required={required} $error={isValid === false && !!value}>
            {label}
          </LabelEl>
        )}

        <InputWrapper>
          <StyledInput
            ref={ref}
            value={value}
            onChange={onChange}
            $error={isValid === false && !!value}
            $valid={isValid === true}
            $variant={$variant}
            $size={$size}
            required={required}
            {...rest}
          />
          {showStatus && (
            <StatusIcon $valid={isValid === true}>
              {isValid ? '✓' : '✗'}
            </StatusIcon>
          )}
        </InputWrapper>

        {helperText && !errorMessage && <HelperEl>{helperText}</HelperEl>}
        {errorMessage && isValid === false && value !== '' && (
          <ErrorEl>⚠ {errorMessage}</ErrorEl>
        )}
      </Wrapper>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
