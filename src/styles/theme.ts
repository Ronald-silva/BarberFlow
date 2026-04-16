// ============================================================
// SHAFAR — Design System v2.0
// Inspirado em Fresha, Booksy e Square Appointments
// Psicologia das Cores: Âmbar/Dourado = Autoridade + Luxo
// Neurociência: Alto contraste foca atenção, dourado ativa confiança
// ============================================================

const withLegacyColorString = <T extends { main: string }>(palette: T) => ({
  ...palette,
  toString() {
    return palette.main;
  },
  valueOf() {
    return palette.main;
  },
});

export const theme = {
  colors: {
    // Brand — Âmbar profundo: poder, exclusividade, luxo artesanal
    primary: withLegacyColorString({
      main: '#C8922A',       // Âmbar mais sóbrio — Premium
      light: '#E8B84B',      // Hover states
      lighter: '#F5D78E',    // Backgrounds sutis
      dark: '#9E6E18',       // Active states
      gradient: 'linear-gradient(135deg, #C8922A 0%, #E8B84B 100%)',
      gradientReverse: 'linear-gradient(135deg, #E8B84B 0%, #C8922A 100%)',
      glow: '0 0 24px rgba(200, 146, 42, 0.35)',
      glowStrong: '0 0 40px rgba(200, 146, 42, 0.5)',
    }),

    // Backgrounds — Escala de carvão premium
    bg: {
      base: '#0A0A0A',       // Preto profundo — base absoluta
      card: '#121212',       // Cards e painéis
      elevated: '#1A1A1A',   // Cards elevados (mais contraste)
      overlay: '#222222',    // Overlays, dropdowns
      border: '#282828',     // Borders sutis
      hover: '#1E1E1E',      // Hover em items de lista
      glass: 'rgba(18, 18, 18, 0.7)', // Glassmorphism base
      glassBorder: 'rgba(255, 255, 255, 0.05)',
    },

    // Text — Hierarquia perfeita de legibilidade
    text: {
      primary: '#FFFFFF',    // Títulos — alta legibilidade
      secondary: '#E0E0E0',  // Corpo de texto
      muted: '#A0A0A0',      // Placeholders, labels
      tertiary: '#707070',   // Metadados
      disabled: '#4A4A4A',   // Disabled states
      inverse: '#0D0D0D',    // Texto em fundos claros
      brand: '#E8B84B',      // Texto com cor de marca
    },

    // Status — Paleta semântica premium com maior vibração
    success: withLegacyColorString({
      main: '#10B981',
      light: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
    }),
    warning: withLegacyColorString({
      main: '#F59E0B',
      light: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    }),
    error: withLegacyColorString({
      main: '#EF4444',
      light: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
    }),
    info: withLegacyColorString({
      main: '#3B82F6',
      light: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
    }),

    // Chaves planas (legado)
    primaryLight: '#E8B84B',
    primaryDark: '#9E6E18',
    primaryHover: '#E8B84B',
    successLight: 'rgba(16, 185, 129, 0.1)',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    errorLight: 'rgba(239, 68, 68, 0.1)',
    infoLight: 'rgba(59, 130, 246, 0.1)',

    // Legado — manter compatibilidade
    background: {
      primary: '#0A0A0A',
      secondary: '#121212',
      tertiary: '#1A1A1A',
      elevated: '#222222',
    },
    border: {
      primary: '#282828',
      secondary: '#333333',
      focus: '#C8922A',
      error: '#EF4444',
      main: '#282828',
    },
    interactive: {
      hover: 'rgba(200, 146, 42, 0.05)',
      pressed: 'rgba(200, 146, 42, 0.1)',
      focus: 'rgba(200, 146, 42, 0.2)',
      disabled: '#1A1A1A',
    },
  },

  // Typography — Inter: O fonte padrão de produtos premium digitais
  typography: {
    fonts: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    },
    fontSizes: {
      '2xs': '0.625rem',   // 10px
      xs: '0.75rem',       // 12px
      sm: '0.875rem',      // 14px
      base: '1rem',        // 16px
      lg: '1.125rem',      // 18px
      xl: '1.25rem',       // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.5rem',     // 40px
      '5xl': '3rem',       // 48px
      '6xl': '3.75rem',    // 60px
      '7xl': '4.5rem',     // 72px
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.15,
      snug: 1.3,
      normal: 1.6,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacings: {
      tighter: '-0.03em',
      tight: '-0.01em',
      normal: '0em',
      wide: '0.01em',
      wider: '0.02em',
      widest: '0.05em',
    },
  },

  // Spacing — Sistema 8pt base (múltiplos de 4)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },

  // Border Radius — Cantos modernos e suaves
  radii: {
    none: '0',
    xs: '2px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // Shadows — Profundidade multi-camada (estilo premium)
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '2xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
    brand: '0 0 15px rgba(200, 146, 42, 0.15), 0 0 30px rgba(200, 146, 42, 0.05)',
    brandStrong: '0 0 25px rgba(200, 146, 42, 0.3), 0 0 50px rgba(200, 146, 42, 0.1)',
    glow: '0 0 24px rgba(200, 146, 42, 0.35)',
  },

  // Breakpoints — Mobile First
  breakpoints: {
    xs: '375px',
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
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
    toast: 1700,
    tooltip: 1800,
  },

  // Transitions — Animações calibradas
  transitions: {
    instant: '80ms ease',
    fast: '150ms ease',
    base: '220ms ease',
    slow: '350ms ease',
    slower: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

export type Theme = typeof theme;