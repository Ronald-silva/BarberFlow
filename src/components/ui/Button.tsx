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
    color: #0d0d0d;
    border: 1px solid transparent;
    font-weight: 700;
    letter-spacing: -0.01em;
    box-shadow: 0 8px 20px color-mix(in srgb, var(--bs-brand-main, #c8922a) 28%, transparent);

    &:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        var(--bs-brand-light, #e8b84b) 0%,
        var(--bs-brand-main, #c8922a) 100%
      );
      box-shadow: 0 12px 26px color-mix(in srgb, var(--bs-brand-main, #c8922a) 38%, transparent);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--bs-brand-main, #c8922a) 32%, transparent);
    }
  `,

  secondary: css`
    background-color: #1D1D1D;
    color: #F5F5F5;
    border: 1px solid #2A2A2A;
    font-weight: 500;

    &:hover:not(:disabled) {
      background-color: #262626;
      border-color: #3A3A3A;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
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
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    min-height: 40px;
    border-radius: 8px;
  `,
  sm: css`
    padding: 0.55rem 1rem;
    font-size: 0.875rem;
    min-height: 44px;
    border-radius: 8px;
  `,
  md: css`
    padding: 0.7rem 1.3rem;
    font-size: 0.9375rem;
    min-height: 48px;
    border-radius: 10px;
  `,
  lg: css`
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    min-height: 54px;
    border-radius: 12px;
  `,
  xl: css`
    padding: 1rem 2rem;
    font-size: 1.0625rem;
    font-weight: 700;
    min-height: 60px;
    border-radius: 14px;
    letter-spacing: -0.01em;
  `,
};

export const Button = styled.button<ButtonProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 220ms cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  font-family: "Inter", -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;

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
