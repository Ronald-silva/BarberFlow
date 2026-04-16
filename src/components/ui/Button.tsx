import styled, { css } from 'styled-components';

// ============================================================
// SHAFAR Button System v2.0
// ============================================================

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  $size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  $fullWidth?: boolean;
  $loading?: boolean;
}

const buttonVariants = {
  primary: css`
    background: linear-gradient(
      135deg,
      var(--bs-brand-main, #c8922a) 0%,
      var(--bs-brand-light, #e8b84b) 100%
    );
    color: #000000;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 700;
    letter-spacing: -0.02em;
    box-shadow: 
      0 10px 20px -5px color-mix(in srgb, var(--bs-brand-main, #c8922a) 30%, transparent),
      0 0 15px color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);

    &:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        var(--bs-brand-light, #e8b84b) 0%,
        var(--bs-brand-main, #c8922a) 100%
      );
      box-shadow: 
        0 15px 30px -8px color-mix(in srgb, var(--bs-brand-main, #c8922a) 40%, transparent),
        0 0 25px color-mix(in srgb, var(--bs-brand-main, #c8922a) 15%, transparent);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
      box-shadow: 0 5px 10px -3px color-mix(in srgb, var(--bs-brand-main, #c8922a) 30%, transparent);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0)
      );
      opacity: 0;
      transition: opacity 200ms ease;
    }

    &:hover:not(:disabled)::before {
      opacity: 1;
    }
  `,

  secondary: css`
    background-color: #1A1A1A;
    color: #FFFFFF;
    border: 1px solid #282828;
    font-weight: 500;

    &:hover:not(:disabled) {
      background-color: #222222;
      border-color: #333333;
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
      color: #FFFFFF;
    }

    &:active:not(:disabled) {
      transform: translateY(1px);
      background-color: #161616;
    }
  `,

  ghost: css`
    background-color: transparent;
    color: #ababab;
    border: 1px solid transparent;
    font-weight: 500;

    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);
      color: var(--bs-brand-light, #e8b84b);
      border-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 22%, transparent);
    }

    &:active:not(:disabled) {
      background-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 16%, transparent);
    }
  `,

  outline: css`
    background-color: transparent;
    color: var(--bs-brand-main, #c8922a);
    border: 1px solid var(--bs-brand-main, #c8922a);
    font-weight: 600;

    &:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 10%, transparent);
      border-color: var(--bs-brand-light, #e8b84b);
      color: var(--bs-brand-light, #e8b84b);
      transform: translateY(-1px);
    }
  `,

  danger: css`
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: #FFFFFF;
    border: 1px solid transparent;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }
  `,

  success: css`
    background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
    color: #FFFFFF;
    border: 1px solid transparent;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 18px rgba(34, 197, 94, 0.4);
      transform: translateY(-1px);
    }
  `,
};

const buttonSizes = {
  xs: css`
    padding: 0.45rem 1rem;
    font-size: 0.75rem;
    min-height: 38px;
    border-radius: 8px;
  `,
  sm: css`
    padding: 0.6rem 1.25rem;
    font-size: 0.8125rem;
    min-height: 42px;
    border-radius: 10px;
  `,
  md: css`
    padding: 0.75rem 1.75rem;
    font-size: 0.9375rem;
    min-height: 48px;
    border-radius: 12px;
  `,
  lg: css`
    padding: 0.9rem 2.25rem;
    font-size: 1rem;
    min-height: 56px;
    border-radius: 14px;
    font-weight: 600;
  `,
  xl: css`
    padding: 1.125rem 2.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    min-height: 64px;
    border-radius: 18px;
    letter-spacing: -0.02em;
  `,
};

export const Button = styled.button<ButtonProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;

  ${props => buttonVariants[props.$variant || 'primary']}
  ${props => buttonSizes[props.$size || 'md']}

  ${props => props.$fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  ${props => props.$loading && css`
    cursor: wait;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
  `}

  &:focus-visible {
    outline: 2px solid var(--bs-brand-main, #c8922a);
    outline-offset: 3px;
  }
`;
