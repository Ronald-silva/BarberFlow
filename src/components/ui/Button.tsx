import styled, { css } from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  $size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  $fullWidth?: boolean;
  $loading?: boolean;
}

const buttonVariants = {
  primary: css`
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid transparent;
    box-shadow: ${props => props.theme.shadows.md};

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, ${props => props.theme.colors.primaryHover} 0%, ${props => props.theme.colors.primaryDark} 100%);
      box-shadow: ${props => props.theme.shadows.lg};
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${props => props.theme.shadows.md};
    }
  `,

  secondary: css`
    background-color: ${props => props.theme.colors.background.elevated};
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid ${props => props.theme.colors.border.primary};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.background.tertiary};
      border-color: ${props => props.theme.colors.border.secondary};
      transform: translateY(-1px);
    }
  `,

  ghost: css`
    background-color: transparent;
    color: ${props => props.theme.colors.text.secondary};
    border: 1px solid ${props => props.theme.colors.border.primary};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.interactive.hover};
      border-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.text.primary};
    }
  `,

  danger: css`
    background-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: #E53E3E;
      transform: translateY(-1px);
    }
  `,

  success: css`
    background-color: ${props => props.theme.colors.success};
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: #25A244;
      transform: translateY(-1px);
    }
  `,
};

const buttonSizes = {
  xs: css`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSizes.xs};
    min-height: 44px; /* Mínimo para toque mobile */

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
      min-height: 32px;
    }
  `,
  sm: css`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.typography.fontSizes.sm};
    min-height: 44px; /* Mínimo para toque mobile */

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
      min-height: 40px;
    }
  `,
  md: css`
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
    font-size: ${props => props.theme.typography.fontSizes.base};
    min-height: 48px; /* Adequado para toque mobile */

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
      min-height: 48px;
    }
  `,
  lg: css`
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
    font-size: ${props => props.theme.typography.fontSizes.lg};
    min-height: 56px;

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      min-height: 56px;
    }
  `,
  xl: css`
    padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[8]};
    font-size: ${props => props.theme.typography.fontSizes.xl};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
    min-height: 64px;

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      min-height: 64px;
    }
  `,
};

export const Button = styled.button<ButtonProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.lg};
  transition: ${props => props.theme.transitions.base};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  ${props => buttonVariants[props.$variant || 'primary']}
  ${props => buttonSizes[props.$size || 'md']}

  ${props => props.$fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;

    &:hover {
      transform: none !important;
    }
  }

  ${props => props.$loading && css`
    cursor: wait;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.border.focus};
    outline-offset: 2px;
  }
`;
