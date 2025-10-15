import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  /* Reset CSS moderno */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 14px; /* Mobile first - smaller base font */
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%; /* Prevent iOS font scaling */
    -ms-text-size-adjust: 100%;
    
    @media (min-width: 640px) { /* sm */
      font-size: 15px;
    }
    
    @media (min-width: 768px) { /* md */
      font-size: 16px;
    }
  }

  body {
    font-family: ${(props) => props.theme.typography.fonts.primary};
    font-size: ${(props) => props.theme.typography.fontSizes.base};
    font-weight: ${(props) => props.theme.typography.fontWeights.normal};
    line-height: ${(props) => props.theme.typography.lineHeights.normal};
    background-color: ${(props) => props.theme.colors.background.primary};
    color: ${(props) => props.theme.colors.text.secondary};
    min-height: 100vh;
    overflow-x: hidden;
    
    /* Better mobile scrolling */
    -webkit-overflow-scrolling: touch;
    
    /* Prevent horizontal scroll on mobile */
    max-width: 100vw;
  }

  /* Elementos interativos */
  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    outline: none;
    
    &:disabled {
      cursor: not-allowed;
    }
  }

  input, textarea {
    outline: none;
    border: none;
    
    &::placeholder {
      color: ${(props) => props.theme.colors.text.tertiary};
    }
  }

  a {
    text-decoration: none;
    color: inherit;
    
    &:focus-visible {
      outline: 2px solid ${(props) => props.theme.colors.border.focus};
      outline-offset: 2px;
    }
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border.secondary};
    border-radius: ${(props) => props.theme.radii.full};
    
    &:hover {
      background: ${(props) => props.theme.colors.text.tertiary};
    }
  }

  /* Focus styles globais */
  *:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.border.focus};
    outline-offset: 2px;
  }

  /* React Calendar Styles - Design moderno e responsivo */
  .react-calendar {
    border: none;
    border-radius: ${(props) => props.theme.radii.lg};
    background-color: ${(props) => props.theme.colors.background.elevated};
    color: ${(props) => props.theme.colors.text.secondary};
    font-family: inherit;
    box-shadow: ${(props) => props.theme.shadows.md};
    padding: ${(props) => props.theme.spacing[3]};
    width: 100%;
    max-width: 100%;
    
    @media (min-width: 640px) {
      border-radius: ${(props) => props.theme.radii.xl};
      box-shadow: ${(props) => props.theme.shadows.lg};
      padding: ${(props) => props.theme.spacing[4]};
      max-width: 350px;
    }
  }

  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: ${(props) => props.theme.spacing[4]};
  }

  .react-calendar__navigation button {
    color: ${(props) => props.theme.colors.text.primary};
    background: none;
    border: none;
    font-size: ${(props) => props.theme.typography.fontSizes.lg};
    font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
    padding: ${(props) => props.theme.spacing[2]} ${(props) =>
  props.theme.spacing[3]};
    border-radius: ${(props) => props.theme.radii.md};
    transition: ${(props) => props.theme.transitions.fast};
    min-width: 44px;
    
    &:enabled:hover,
    &:enabled:focus {
      background-color: ${(props) => props.theme.colors.interactive.hover};
    }
    
    &:disabled {
      color: ${(props) => props.theme.colors.text.disabled};
    }
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: ${(props) => props.theme.typography.fontWeights.medium};
    font-size: ${(props) => props.theme.typography.fontSizes.xs};
    color: ${(props) => props.theme.colors.text.tertiary};
    margin-bottom: ${(props) => props.theme.spacing[2]};
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: ${(props) => props.theme.spacing[2]};
    text-decoration: none;
  }

  .react-calendar__tile {
    background: none;
    border: none;
    border-radius: ${(props) => props.theme.radii.md};
    color: ${(props) => props.theme.colors.text.secondary};
    font-size: ${(props) => props.theme.typography.fontSizes.sm};
    font-weight: ${(props) => props.theme.typography.fontWeights.medium};
    padding: ${(props) => props.theme.spacing[2]};
    transition: ${(props) => props.theme.transitions.fast};
    position: relative;
    min-height: 44px; /* Better touch target for mobile */
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (min-width: 640px) {
      padding: ${(props) => props.theme.spacing[3]};
      min-height: 40px;
    }
    
    &:enabled:hover,
    &:enabled:focus {
      background-color: ${(props) => props.theme.colors.interactive.hover};
      
      @media (min-width: 640px) {
        transform: translateY(-1px);
      }
    }
    
    &:disabled {
      color: ${(props) => props.theme.colors.text.disabled};
      cursor: not-allowed;
    }
  }

  .react-calendar__tile--now {
    background: ${(props) => props.theme.colors.background.tertiary};
    color: ${(props) => props.theme.colors.text.primary};
    font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
    
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: ${(props) => props.theme.colors.primary};
      border-radius: ${(props) => props.theme.radii.full};
    }
  }

  .react-calendar__tile--active,
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: ${(props) => props.theme.colors.primary} !important;
    color: ${(props) => props.theme.colors.text.inverse} !important;
    font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
    box-shadow: ${(props) => props.theme.shadows.glow};
    transform: translateY(-2px);
  }

  .react-calendar__month-view__days__day--weekend {
    color: ${(props) => props.theme.colors.warning};
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: ${(props) => props.theme.colors.text.disabled};
  }

  /* Animações suaves */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }

  /* Mobile-specific improvements */
  @media (max-width: 1023px) {
    /* Improve touch targets */
    button, a, input, select, textarea {
      min-height: 44px;
    }
    
    /* Better spacing for mobile */
    .mobile-spacing {
      padding: ${(props) => props.theme.spacing[4]};
    }
    
    /* Hide desktop-only elements */
    .desktop-only {
      display: none !important;
    }
    
    /* Full width on mobile */
    .mobile-full-width {
      width: 100% !important;
    }
  }

  @media (min-width: 1024px) {
    /* Hide mobile-only elements */
    .mobile-only {
      display: none !important;
    }
  }

  /* Safe area support for iOS devices */
  @supports (padding: max(0px)) {
    body {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }
`;
