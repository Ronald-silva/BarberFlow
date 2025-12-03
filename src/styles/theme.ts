export const theme = {
  colors: {
    // Brand Colors - Paleta dourada premium
    primary: '#D4AF37', // Dourado mais vibrante
    primaryHover: '#B8941F',
    primaryLight: '#F4E4A6',
    primaryDark: '#A67C00',
    
    // Background Colors - Tons escuros sofisticados
    background: {
      primary: '#0A0A0A', // Preto mais profundo
      secondary: '#1C1C1E', // Cinza escuro Apple-like
      tertiary: '#2C2C2E', // Cinza médio
      elevated: '#3A3A3C', // Cinza elevado para cards
    },
    
    // Text Colors - Hierarquia clara
    text: {
      primary: '#FFFFFF', // Branco puro para títulos
      secondary: '#E5E5E7', // Cinza claro para texto principal
      tertiary: '#8E8E93', // Cinza médio para texto secundário
      disabled: '#48484A', // Cinza escuro para disabled
      inverse: '#1C1C1E', // Texto escuro para fundos claros
    },
    
    // Semantic Colors - Estados e feedback
    success: '#30D158',
    successLight: '#30D15820',
    warning: '#FF9F0A',
    warningLight: '#FF9F0A20',
    error: '#FF453A',
    errorLight: '#FF453A20',
    info: '#007AFF',
    infoLight: '#007AFF20',
    
    // Interactive Colors
    interactive: {
      hover: '#FFFFFF10',
      pressed: '#FFFFFF20',
      focus: '#D4AF3750',
      disabled: '#48484A',
    },
    
    // Border Colors
    border: {
      primary: '#38383A',
      secondary: '#48484A',
      focus: '#D4AF37',
      error: '#FF453A',
    },
  },
  
  // Typography Scale - Baseado em design systems modernos
  typography: {
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing Scale - Sistema 8pt
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Border Radius - Consistência visual
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows - Profundidade e elevação
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)',
  },
  
  // Breakpoints - Design responsivo
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index Scale - Camadas organizadas
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Transitions - Animações consistentes
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    slower: '500ms ease',
  },
};