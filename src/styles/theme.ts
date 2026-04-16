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
      base: '#0D0D0D',       // Preto carvão — base absoluta
      card: '#141414',       // Cards e painéis
      elevated: '#242424',   // Cards elevados (mais contraste)
      overlay: '#2B2B2B',    // Overlays, dropdowns
      border: '#3A3A3A',     // Borders mais visíveis
      hover: '#303030',      // Hover em items de lista
    },

    // Text — Hierarquia perfeita de legibilidade
    text: {
      primary: '#F5F5F5',    // Títulos — alta legibilidade
      secondary: '#D2D2D2',  // Corpo de texto
      muted: '#A6A6A6',      // Placeholders, labels
      tertiary: '#A6A6A6',   // Alias (legado)
      disabled: '#747474',   // Disabled states
      inverse: '#0D0D0D',    // Texto em fundos claros
      brand: '#E8B84B',      // Texto com cor de marca
    },

    // Status — Paleta semântica premium
    success: withLegacyColorString({
      main: '#22C55E',
      light: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.3)',
    }),
    warning: withLegacyColorString({
      main: '#F59E0B',
      light: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
    }),
    error: withLegacyColorString({
      main: '#EF4444',
      light: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
    }),
    info: withLegacyColorString({
      main: '#3B82F6',
      light: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.3)',
    }),

    // Chaves planas (legado) — usadas em vários styled-components
    primaryLight: '#E8B84B',
    primaryDark: '#9E6E18',
    primaryHover: '#E8B84B',
    successLight: 'rgba(34, 197, 94, 0.12)',
    warningLight: 'rgba(245, 158, 11, 0.12)',
    errorLight: 'rgba(239, 68, 68, 0.12)',
    infoLight: 'rgba(59, 130, 246, 0.12)',

    // Legado — manter compatibilidade com componentes existentes
    background: {
      primary: '#0D0D0D',
      secondary: '#141414',
      tertiary: '#242424',
      elevated: '#2B2B2B',
    },
    border: {
      primary: '#3A3A3A',
      secondary: '#4A4A4A',
      focus: '#C8922A',
      error: '#EF4444',
      main: '#3A3A3A',
    },
    interactive: {
      hover: 'rgba(200, 146, 42, 0.08)',
      pressed: 'rgba(200, 146, 42, 0.15)',
      focus: 'rgba(200, 146, 42, 0.25)',
      disabled: '#2A2A2A',
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
      '4xl': '2.25rem',    // 36px
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
      tight: 1.2,
      snug: 1.375,
      normal: 1.55,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacings: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing — Sistema 4pt base (múltiplos de 4)
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

  // Border Radius — Cantos suaves mas precisos
  radii: {
    none: '0',
    xs: '0.125rem',   // 2px
    sm: '0.25rem',    // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows — Profundidade realista no escuro
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.4)',
    sm: '0 4px 10px rgba(0, 0, 0, 0.35)',
    base: '0 8px 18px rgba(0, 0, 0, 0.4)',
    md: '0 12px 28px rgba(0, 0, 0, 0.45)',
    lg: '0 18px 36px rgba(0, 0, 0, 0.5)',
    xl: '0 24px 52px rgba(0, 0, 0, 0.56)',
    '2xl': '0 32px 64px rgba(0, 0, 0, 0.7)',
    brand: '0 8px 24px rgba(200, 146, 42, 0.25)',
    brandStrong: '0 16px 40px rgba(200, 146, 42, 0.4)',
    // Legado
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