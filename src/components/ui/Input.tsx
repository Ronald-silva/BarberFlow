import styled, { css } from 'styled-components';

interface InputProps {
  $variant?: 'default' | 'filled' | 'outlined';
  $size?: 'sm' | 'md' | 'lg';
  $error?: boolean;
}

const inputVariants = {
  default: css`
    background-color: ${props => props.theme.colors.background.secondary};
    border: 1px solid ${props => props.theme.colors.border.primary};
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);

    &:hover:not(:focus):not(:disabled) {
      border-color: ${props => props.theme.colors.border.secondary};
      background-color: ${props => props.theme.colors.background.tertiary};
    }

    &:focus {
      border-color: ${props => props.theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.interactive.focus}, ${props => props.theme.shadows.base};
      background-color: ${props => props.theme.colors.background.tertiary};
    }
  `,

  filled: css`
    background-color: ${props => props.theme.colors.background.tertiary};
    border: 1px solid transparent;

    &:hover:not(:focus):not(:disabled) {
      background-color: ${props => props.theme.colors.background.elevated};
    }

    &:focus {
      border-color: ${props => props.theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.interactive.focus};
    }
  `,

  outlined: css`
    background-color: transparent;
    border: 2px solid ${props => props.theme.colors.border.primary};

    &:hover:not(:focus):not(:disabled) {
      border-color: ${props => props.theme.colors.border.secondary};
    }

    &:focus {
      border-color: ${props => props.theme.colors.border.focus};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.interactive.focus};
    }
  `,
};

const inputSizes = {
  sm: css`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.typography.fontSizes.base};
    min-height: 44px;
  `,
  md: css`
    padding: ${props => props.theme.spacing[3.5]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.typography.fontSizes.base};
    min-height: 48px;
  `,
  lg: css`
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
    font-size: ${props => props.theme.typography.fontSizes.lg};
    min-height: 56px;

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      min-height: 56px;
    }
  `,
};

export const Input = styled.input<InputProps>`
  width: 100%;
  border-radius: ${props => props.theme.radii.lg};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: ${props => props.theme.transitions.base};

  ${props => inputVariants[props.$variant || 'default']}
  ${props => inputSizes[props.$size || 'md']}

  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
    font-weight: ${props => props.theme.typography.fontWeights.normal};
  }

  ${props => props.$error && css`
    border-color: ${props => props.theme.colors.error} !important;

    &:focus {
      box-shadow: 0 0 0 3px ${props => props.theme.colors.errorLight};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.disabled};
  }
`;

export const Label = styled.label<{ $required?: boolean; $error?: boolean }>`
  display: block;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.$error ? props.theme.colors.error : props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
  letter-spacing: ${props => props.theme.typography.letterSpacings.wide};

  ${props => props.$required && css`
    &::after {
      content: ' *';
      color: ${props => props.theme.colors.error};
    }
  `}
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2.5]};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${props => props.theme.spacing[4]};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    gap: ${props => props.theme.spacing[5]};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: ${props => props.theme.spacing[6]};
  }
`;

export const ErrorText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.error};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-top: ${props => props.theme.spacing[1]};
`;

export const HelperText = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: ${props => props.theme.typography.fontWeights.normal};
  margin-top: ${props => props.theme.spacing[1]};
`;
